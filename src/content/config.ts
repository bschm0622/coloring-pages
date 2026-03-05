import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),
  }),
});

const coloringPages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
    imageUrl: z.string(),
    pdfUrl: z.string().optional(),
    draft: z.boolean().default(false),
    pubDate: z.date(),
  }),
});

export const collections = { blog, coloringPages };
