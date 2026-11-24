import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts live in src/content/blog as Markdown files.
// A simple browser editor (e.g. Decap/Sveltia CMS) can write to this same folder later.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string().default('Kristen Dean'),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    // Reserved for the membership phase: posts marked true will be for members only.
    membersOnly: z.boolean().default(false),
  }),
});

export const collections = { blog };
