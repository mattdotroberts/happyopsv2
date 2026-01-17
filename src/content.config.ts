import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    featured: z.boolean().optional().default(false),
    draft: z.boolean().optional().default(false),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    features: z.array(z.string()),
    icon: z.string().optional(),
    order: z.number(),
    cta: z.string().optional(),
    featured: z.boolean().optional().default(false),
  }),
});

const useCases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/use-cases' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['Human Resources', 'Sales', 'Marketing', 'Customer Support', 'AI', 'Automation']),
    pubDate: z.coerce.date(),
    image: z.string().optional(),
    headline: z.string().optional(),
    featured: z.boolean().optional().default(false),
  }),
});

export const collections = { blog, services, useCases };
