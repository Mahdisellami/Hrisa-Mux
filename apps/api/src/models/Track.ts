import { pgTable, uuid, varchar, integer, text, bigint, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './User';

export const tracks = pgTable('tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }),
  album: varchar('album', { length: 255 }),
  duration: integer('duration').notNull(),
  sourceType: varchar('source_type', { length: 20 }).notNull(),
  sourceId: varchar('source_id', { length: 255 }).notNull(),
  sourceUrl: varchar('source_url', { length: 500 }),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  metadata: jsonb('metadata'),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  filePath: varchar('file_path', { length: 500 }),
  fileSize: bigint('file_size', { mode: 'number' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;
