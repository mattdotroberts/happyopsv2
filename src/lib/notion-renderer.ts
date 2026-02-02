import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

// Helper to convert rich text to HTML
function richTextToHtml(richText: RichTextItemResponse[]): string {
  return richText
    .map((text) => {
      let content = escapeHtml(text.plain_text);

      // Apply annotations
      if (text.annotations.bold) {
        content = `<strong>${content}</strong>`;
      }
      if (text.annotations.italic) {
        content = `<em>${content}</em>`;
      }
      if (text.annotations.strikethrough) {
        content = `<del>${content}</del>`;
      }
      if (text.annotations.underline) {
        content = `<u>${content}</u>`;
      }
      if (text.annotations.code) {
        content = `<code>${content}</code>`;
      }

      // Handle links
      if (text.type === 'text' && text.text.link) {
        content = `<a href="${escapeHtml(text.text.link.url)}" target="_blank" rel="noopener noreferrer">${content}</a>`;
      }

      return content;
    })
    .join('');
}

// Escape HTML special characters
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Get color class for Notion colors
function getColorClass(color: string): string {
  if (color === 'default') return '';

  const colorMap: Record<string, string> = {
    gray: 'text-gray',
    brown: 'text-brown',
    orange: 'text-orange',
    yellow: 'text-yellow',
    green: 'text-green',
    blue: 'text-blue',
    purple: 'text-purple',
    pink: 'text-pink',
    red: 'text-red',
    gray_background: 'bg-gray',
    brown_background: 'bg-brown',
    orange_background: 'bg-orange',
    yellow_background: 'bg-yellow',
    green_background: 'bg-green',
    blue_background: 'bg-blue',
    purple_background: 'bg-purple',
    pink_background: 'bg-pink',
    red_background: 'bg-red',
  };

  return colorMap[color] || '';
}

// Render a single block to HTML
function renderBlock(block: BlockObjectResponse): string {
  const type = block.type;
  const blockData = (block as any)[type];

  switch (type) {
    case 'paragraph': {
      const content = richTextToHtml(blockData.rich_text);
      if (!content) return '';
      const colorClass = getColorClass(blockData.color);
      return `<p${colorClass ? ` class="${colorClass}"` : ''}>${content}</p>`;
    }

    case 'heading_1': {
      const content = richTextToHtml(blockData.rich_text);
      const colorClass = getColorClass(blockData.color);
      return `<h2${colorClass ? ` class="${colorClass}"` : ''}>${content}</h2>`;
    }

    case 'heading_2': {
      const content = richTextToHtml(blockData.rich_text);
      const colorClass = getColorClass(blockData.color);
      return `<h3${colorClass ? ` class="${colorClass}"` : ''}>${content}</h3>`;
    }

    case 'heading_3': {
      const content = richTextToHtml(blockData.rich_text);
      const colorClass = getColorClass(blockData.color);
      return `<h4${colorClass ? ` class="${colorClass}"` : ''}>${content}</h4>`;
    }

    case 'bulleted_list_item': {
      const content = richTextToHtml(blockData.rich_text);
      let html = `<li>${content}`;
      if ((block as any).children?.length) {
        html += `<ul>${renderBlocks((block as any).children)}</ul>`;
      }
      html += '</li>';
      return html;
    }

    case 'numbered_list_item': {
      const content = richTextToHtml(blockData.rich_text);
      let html = `<li>${content}`;
      if ((block as any).children?.length) {
        html += `<ol>${renderBlocks((block as any).children)}</ol>`;
      }
      html += '</li>';
      return html;
    }

    case 'to_do': {
      const content = richTextToHtml(blockData.rich_text);
      const checked = blockData.checked ? 'checked' : '';
      return `<div class="todo-item"><input type="checkbox" ${checked} disabled /><span>${content}</span></div>`;
    }

    case 'toggle': {
      const content = richTextToHtml(blockData.rich_text);
      let childrenHtml = '';
      if ((block as any).children?.length) {
        childrenHtml = renderBlocks((block as any).children);
      }
      return `<details><summary>${content}</summary><div class="toggle-content">${childrenHtml}</div></details>`;
    }

    case 'code': {
      const content = escapeHtml(
        blockData.rich_text.map((t: RichTextItemResponse) => t.plain_text).join('')
      );
      const language = blockData.language || 'text';
      return `<pre><code class="language-${language}">${content}</code></pre>`;
    }

    case 'quote': {
      const content = richTextToHtml(blockData.rich_text);
      const colorClass = getColorClass(blockData.color);
      return `<blockquote${colorClass ? ` class="${colorClass}"` : ''}>${content}</blockquote>`;
    }

    case 'callout': {
      const content = richTextToHtml(blockData.rich_text);
      const icon = blockData.icon?.emoji || '';
      const colorClass = getColorClass(blockData.color);
      return `<aside class="callout${colorClass ? ` ${colorClass}` : ''}"><span class="callout-icon">${icon}</span><div class="callout-content">${content}</div></aside>`;
    }

    case 'divider':
      return '<hr />';

    case 'image': {
      let url = '';
      let caption = '';

      if (blockData.type === 'file') {
        url = blockData.file.url;
      } else if (blockData.type === 'external') {
        url = blockData.external.url;
      }

      if (blockData.caption?.length) {
        caption = richTextToHtml(blockData.caption);
      }

      if (!url) return '';

      return `<figure><img src="${escapeHtml(url)}" alt="${caption ? escapeHtml(blockData.caption.map((t: RichTextItemResponse) => t.plain_text).join('')) : ''}" loading="lazy" />${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
    }

    case 'video': {
      let url = '';
      if (blockData.type === 'file') {
        url = blockData.file.url;
      } else if (blockData.type === 'external') {
        url = blockData.external.url;
      }

      if (!url) return '';

      // Check if it's a YouTube/Vimeo embed
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = extractYouTubeId(url);
        if (videoId) {
          return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`;
        }
      }

      return `<video src="${escapeHtml(url)}" controls></video>`;
    }

    case 'embed': {
      const url = blockData.url;
      if (!url) return '';
      return `<div class="embed"><iframe src="${escapeHtml(url)}" frameborder="0" loading="lazy"></iframe></div>`;
    }

    case 'bookmark': {
      const url = blockData.url;
      const caption = blockData.caption?.length
        ? richTextToHtml(blockData.caption)
        : url;
      return `<a href="${escapeHtml(url)}" class="bookmark" target="_blank" rel="noopener noreferrer">${caption}</a>`;
    }

    case 'table': {
      // Tables require fetching children separately
      // For now, render a placeholder
      return '<div class="table-placeholder">[Table]</div>';
    }

    case 'column_list': {
      if (!(block as any).children?.length) return '';
      const columns = (block as any).children
        .map((col: BlockObjectResponse) => {
          const colContent = (col as any).children?.length
            ? renderBlocks((col as any).children)
            : '';
          return `<div class="column">${colContent}</div>`;
        })
        .join('');
      return `<div class="columns">${columns}</div>`;
    }

    case 'column': {
      // Handled by column_list
      return '';
    }

    default:
      // Unsupported block type
      console.warn(`Unsupported block type: ${type}`);
      return '';
  }
}

// Extract YouTube video ID from URL
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Render an array of blocks to HTML, grouping list items
export function renderBlocks(blocks: BlockObjectResponse[]): string {
  const html: string[] = [];
  let currentListType: 'bulleted' | 'numbered' | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      const tag = currentListType === 'numbered' ? 'ol' : 'ul';
      html.push(`<${tag}>${listItems.join('')}</${tag}>`);
      listItems = [];
      currentListType = null;
    }
  };

  for (const block of blocks) {
    if (block.type === 'bulleted_list_item') {
      if (currentListType !== 'bulleted') {
        flushList();
        currentListType = 'bulleted';
      }
      listItems.push(renderBlock(block));
    } else if (block.type === 'numbered_list_item') {
      if (currentListType !== 'numbered') {
        flushList();
        currentListType = 'numbered';
      }
      listItems.push(renderBlock(block));
    } else {
      flushList();
      const blockHtml = renderBlock(block);
      if (blockHtml) {
        html.push(blockHtml);
      }
    }
  }

  flushList();

  return html.join('\n');
}

// Main export: render all blocks for a post
export function renderNotionContent(blocks: BlockObjectResponse[]): string {
  return renderBlocks(blocks);
}
