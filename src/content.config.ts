import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const chapters = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/chapters' }),
  schema: z.object({
    chapterNumber: z.string(),
    order: z.number().int(),
    part: z.enum(['part-1', 'appendix']),
    title: z.string(),
    summary: z.string(),
    modelRequirement: z.enum(['none', 'partial', 'optional', 'required']),
    estimatedMinutes: z.number().int(),
    e2eVersion: z.string().default('0.25.0'),
    webVersion: z.string().default('0.17.0'),
    prerequisites: z.array(z.string()).default([]),
    solutionFiles: z
      .array(
        z.object({
          filename: z.string(),
          lang: z.string(),
          sourcePath: z.string(),
        }),
      )
      .default([]),
  }),
});

export const collections = { chapters };
