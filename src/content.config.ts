import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    syndicate: z.boolean().optional(),
    devtoId: z.number().optional()
  })
});

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    syndicate: z.boolean().optional(),
    devtoId: z.number().optional()
  })
});

const now = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/now' }),
  schema: z.object({
    updatedDate: z.coerce.date(),
    archived: z.boolean().optional(),
    month: z.string().optional(),
    year: z.number().optional()
  })
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional()
  })
});

export const collections = { writing, notes, now, projects };
