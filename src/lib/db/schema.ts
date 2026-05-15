import { pgTable, text, timestamp, varchar, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // WorkOS User ID
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  profilePictureUrl: text('profile_picture_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workouts = pgTable('workouts', {
  id: text('id').primaryKey(), // UUID
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  content: text('content').notNull(), // JSON string of the workout
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userStates = pgTable('user_states', {
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  key: varchar('key', { length: 255 }).notNull(),
  value: text('value').notNull(), // JSON string
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.key] }),
}));
