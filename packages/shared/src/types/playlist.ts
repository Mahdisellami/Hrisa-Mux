import { z } from 'zod';

export const playlistSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  coverImageUrl: z.string().url().optional(),
  isPublic: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Playlist = z.infer<typeof playlistSchema>;

export const createPlaylistSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  isPublic: z.boolean().default(false),
});

export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;

export const updatePlaylistSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  isPublic: z.boolean().optional(),
  coverImageUrl: z.string().url().optional(),
});

export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>;

export const playlistTrackSchema = z.object({
  id: z.string().uuid(),
  playlistId: z.string().uuid(),
  trackId: z.string().uuid(),
  position: z.number().int().nonnegative(),
  addedAt: z.date(),
  addedBy: z.string().uuid(),
});

export type PlaylistTrack = z.infer<typeof playlistTrackSchema>;
