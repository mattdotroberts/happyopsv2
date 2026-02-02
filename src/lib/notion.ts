import { Client } from '@notionhq/client';
import type {
  PageObjectResponse,
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

// Check for API key (works in both Astro and Node.js environments)
const NOTION_API_KEY = import.meta.env.NOTION_API_KEY || process.env.NOTION_API_KEY;

if (!NOTION_API_KEY) {
  console.warn('NOTION_API_KEY is not set. Blog posts will not be fetched from Notion.');
}

// Initialize Notion client (only if API key exists)
const notion = NOTION_API_KEY
  ? new Client({ auth: NOTION_API_KEY })
  : null;

// Blog Posts database ID
const BLOG_DATABASE_ID = '2fb015f2-adfc-80c9-a0ff-000b6d1c43a9';

// Types for our blog posts
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  status: 'Draft' | 'In Review' | 'Published';
  publishedDate: Date | null;
  author: string | null;
  image: string | null;
  tags: string[];
  excerpt: string;
}

export interface BlogPostWithContent extends BlogPost {
  blocks: BlockObjectResponse[];
}

// Helper to extract plain text from rich text
function richTextToPlain(richText: RichTextItemResponse[]): string {
  return richText.map((text) => text.plain_text).join('');
}

// Helper to create a URL-friendly slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper to get image URL from Notion file property
function getImageUrl(files: any[]): string | null {
  if (!files || files.length === 0) return null;
  const file = files[0];
  if (file.type === 'file') {
    return file.file.url;
  } else if (file.type === 'external') {
    return file.external.url;
  }
  return null;
}

// Helper to get author name from people property
function getAuthorName(people: any[]): string | null {
  if (!people || people.length === 0) return null;
  return people[0].name || null;
}

// Transform Notion page to BlogPost
function pageToPost(page: PageObjectResponse): BlogPost {
  const properties = page.properties;

  // Get title
  const titleProp = properties['Title'];
  const title =
    titleProp?.type === 'title'
      ? richTextToPlain(titleProp.title)
      : 'Untitled';

  // Get status
  const statusProp = properties['Status'];
  const status =
    statusProp?.type === 'status'
      ? (statusProp.status?.name as BlogPost['status']) || 'Draft'
      : 'Draft';

  // Get published date
  const dateProp = properties['Published Date'];
  const publishedDate =
    dateProp?.type === 'date' && dateProp.date?.start
      ? new Date(dateProp.date.start)
      : null;

  // Get author
  const authorProp = properties['Author'];
  const author =
    authorProp?.type === 'people'
      ? getAuthorName(authorProp.people)
      : null;

  // Get main image
  const imageProp = properties['Main Image'];
  const image =
    imageProp?.type === 'files'
      ? getImageUrl(imageProp.files)
      : null;

  // Get tags
  const tagsProp = properties['Tags'];
  const tags =
    tagsProp?.type === 'multi_select'
      ? tagsProp.multi_select.map((tag) => tag.name)
      : [];

  return {
    id: page.id,
    slug: createSlug(title),
    title,
    status,
    publishedDate,
    author,
    image,
    tags,
    excerpt: '', // Will be populated from content if needed
  };
}

// Fetch all published blog posts
export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!notion) {
    console.warn('Notion client not initialized. Returning empty posts.');
    return [];
  }

  try {
    // Using dataSources.query (SDK v5+) with data_source_id
    const response = await notion.dataSources.query({
      data_source_id: BLOG_DATABASE_ID,
      filter: {
        property: 'Status',
        status: {
          equals: 'Published',
        },
      },
      sorts: [
        {
          property: 'Published Date',
          direction: 'descending',
        },
      ],
    });

    return response.results
      .filter((page): page is PageObjectResponse => 'properties' in page)
      .map(pageToPost);
  } catch (error) {
    console.error('Error fetching published posts:', error);
    return [];
  }
}

// Fetch posts by tag
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  if (!notion) {
    return [];
  }

  try {
    const response = await notion.dataSources.query({
      data_source_id: BLOG_DATABASE_ID,
      filter: {
        and: [
          {
            property: 'Status',
            status: {
              equals: 'Published',
            },
          },
          {
            property: 'Tags',
            multi_select: {
              contains: tag,
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Published Date',
          direction: 'descending',
        },
      ],
    });

    return response.results
      .filter((page): page is PageObjectResponse => 'properties' in page)
      .map(pageToPost);
  } catch (error) {
    console.error(`Error fetching posts for tag ${tag}:`, error);
    return [];
  }
}

// Get all unique tags from published posts
export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

// Fetch a single post by slug
export async function getPostBySlug(
  slug: string
): Promise<BlogPostWithContent | null> {
  try {
    // First, get all published posts to find the one with matching slug
    const posts = await getPublishedPosts();
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
      return null;
    }

    // Fetch the page blocks
    const blocks = await getPageBlocks(post.id);

    return {
      ...post,
      blocks,
    };
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    return null;
  }
}

// Fetch all blocks for a page
async function getPageBlocks(pageId: string): Promise<BlockObjectResponse[]> {
  if (!notion) {
    return [];
  }

  const blocks: BlockObjectResponse[] = [];

  try {
    let cursor: string | undefined;

    do {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      });

      for (const block of response.results) {
        if ('type' in block) {
          blocks.push(block as BlockObjectResponse);

          // Recursively fetch children for blocks that have them
          if (block.has_children) {
            const children = await getPageBlocks(block.id);
            // We'll handle nested blocks in the renderer
            (block as any).children = children;
          }
        }
      }

      cursor = response.next_cursor ?? undefined;
    } while (cursor);
  } catch (error) {
    console.error(`Error fetching blocks for page ${pageId}:`, error);
  }

  return blocks;
}
