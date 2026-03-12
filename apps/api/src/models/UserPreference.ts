import { pgTable, uuid, real, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './User';

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  volume: real('volume').notNull().default(0.8),
  repeatMode: varchar('repeat_mode', { length: 20 }).notNull().default('off'),
  shuffleEnabled: boolean('shuffle_enabled').notNull().default(false),
  qualityPreference: varchar('quality_preference', { length: 20 }).notNull().default('auto'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
