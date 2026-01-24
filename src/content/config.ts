import { defineCollection, z } from 'astro:content';

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional()
  })
});

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional()
  })
});

const now = defineCollection({
  type: 'content',
  schema: z.object({
    updatedDate: z.coerce.date(),
    archived: z.boolean().optional(),
    month: z.string().optional(),
    year: z.number().optional()
  })
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional()
  })
});

export const collections = { writing, notes, now, projects };
