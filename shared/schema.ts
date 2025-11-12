import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  moral: text("moral"),
  fullContent: text("full_content").notNull(),
  imageUrl: text("image_url").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  isTranslated: boolean("is_translated").default(false),
  originalLanguage: varchar("original_language", { length: 50 }),
  sourceType: varchar("source_type", { length: 20 }).notNull(),
  authorId: varchar("author_id").references(() => users.id),
  authorName: text("author_name"),
  likeCount: integer("like_count").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const likedStories = pgTable("liked_stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  storyId: varchar("story_id").notNull().references(() => stories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dismissedStories = pgTable("dismissed_stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  storyId: varchar("story_id").notNull().references(() => stories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  likeCount: true,
  createdAt: true,
});

export const insertLikedStorySchema = createInsertSchema(likedStories).omit({
  id: true,
  createdAt: true,
});

export const insertDismissedStorySchema = createInsertSchema(dismissedStories).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;
export type InsertLikedStory = z.infer<typeof insertLikedStorySchema>;
export type LikedStory = typeof likedStories.$inferSelect;
export type InsertDismissedStory = z.infer<typeof insertDismissedStorySchema>;
export type DismissedStory = typeof dismissedStories.$inferSelect;
