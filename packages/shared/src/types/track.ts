import { z } from 'zod';

export const sourceTypeSchema = z.enum(['youtube', 'soundcloud', 'local']);

export type SourceType = z.infer<typeof sourceTypeSchema>;

export const trackSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  artist: z.string().optional(),
  album: z.string().optional(),
  duration: z.number().int().positive(),
  sourceType: sourceTypeSchema,
  sourceId: z.string(),
  sourceUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
  uploadedBy: z.string().uuid().optional(),
  filePath: z.string().optional(),
  fileSize: z.number().int().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Track = z.infer<typeof trackSchema>;

export const createTrackSchema = z.object({
  title: z.string(),
  artist: z.string().optional(),
  album: z.string().optional(),
  duration: z.number().int().positive(),
  sourceType: sourceTypeSchema,
  sourceId: z.string(),
  sourceUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateTrackInput = z.infer<typeof createTrackSchema>;
