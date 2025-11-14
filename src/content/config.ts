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
    updatedDate: z.coerce.date()
  })
});

const thoughts = defineCollection({
  type: 'content',
  schema: z.object({
    pubDate: z.coerce.date(),
    pubTime: z.string().optional(),
    tags: z.array(z.string()).optional()
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

export const collections = { writing, notes, now, thoughts, projects };
