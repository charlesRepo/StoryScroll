import { 
  type User, 
  type InsertUser, 
  type Story, 
  type InsertStory, 
  type LikedStory, 
  type InsertLikedStory,
  type DismissedStory,
  type InsertDismissedStory,
  users,
  stories,
  likedStories,
  dismissedStories
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, notInArray, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(id: string, preferences: { preferredLanguage?: string; preferredAgeRange?: string }): Promise<User | undefined>;
  updateUserProfile(id: string, updates: { username?: string; email?: string | null; password?: string }): Promise<User | undefined>;

  // Story operations
  getStory(id: string): Promise<Story | undefined>;
  getStories(filters: { language?: string; ageRange?: string | string[]; isPublic?: boolean; excludeIds?: string[] }): Promise<Story[]>;
  getUserStories(userId: string): Promise<Story[]>;
  getStoryByAuthorAndTitle(authorId: string, title: string): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: string, updates: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: string): Promise<void>;
  incrementStoryLikes(storyId: string): Promise<void>;
  decrementStoryLikes(storyId: string): Promise<void>;

  // Liked stories operations
  getUserLikedStories(userId: string): Promise<Story[]>;
  likeStory(userId: string, storyId: string): Promise<LikedStory>;
  unlikeStory(userId: string, storyId: string): Promise<void>;
  isStoryLiked(userId: string, storyId: string): Promise<boolean>;

  // Dismissed stories operations
  getUserDismissedStories(userId: string): Promise<Story[]>;
  dismissStory(userId: string, storyId: string): Promise<DismissedStory>;
  restoreStory(userId: string, storyId: string): Promise<void>;
  isStoryDismissed(userId: string, storyId: string): Promise<boolean>;
  getUserDismissedStoryIds(userId: string): Promise<string[]>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUserPreferences(id: string, preferences: { preferredLanguage?: string; preferredAgeRange?: string }): Promise<User | undefined> {
    const result = await db.update(users)
      .set(preferences)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUserProfile(id: string, updates: { username?: string; email?: string | null; password?: string }): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Story operations
  async getStory(id: string): Promise<Story | undefined> {
    const result = await db.select().from(stories).where(eq(stories.id, id));
    return result[0];
  }

  async getStories(filters: { language?: string; ageRange?: string | string[]; isPublic?: boolean; excludeIds?: string[] } = {}): Promise<Story[]> {
    let query = db.select().from(stories);
    
    const conditions = [];
    if (filters.language) conditions.push(eq(stories.language, filters.language));
    
    // Support both single age range and multiple age ranges
    if (filters.ageRange) {
      if (Array.isArray(filters.ageRange)) {
        conditions.push(inArray(stories.ageRange, filters.ageRange));
      } else {
        conditions.push(eq(stories.ageRange, filters.ageRange));
      }
    }
    
    if (filters.isPublic !== undefined) conditions.push(eq(stories.isPublic, filters.isPublic));
    if (filters.excludeIds && filters.excludeIds.length > 0) {
      conditions.push(notInArray(stories.id, filters.excludeIds));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(stories.createdAt));
  }

  async createStory(story: InsertStory): Promise<Story> {
    const result = await db.insert(stories).values(story).returning();
    return result[0];
  }

  async getUserStories(userId: string): Promise<Story[]> {
    return await db.select()
      .from(stories)
      .where(eq(stories.authorId, userId))
      .orderBy(desc(stories.createdAt));
  }

  async getStoryByAuthorAndTitle(authorId: string, title: string): Promise<Story | undefined> {
    const result = await db.select()
      .from(stories)
      .where(and(eq(stories.authorId, authorId), eq(stories.title, title)));
    return result[0];
  }

  async updateStory(id: string, updates: Partial<InsertStory>): Promise<Story | undefined> {
    const result = await db.update(stories)
      .set(updates)
      .where(eq(stories.id, id))
      .returning();
    return result[0];
  }

  async deleteStory(id: string): Promise<void> {
    await db.delete(stories).where(eq(stories.id, id));
  }

  async incrementStoryLikes(storyId: string): Promise<void> {
    const story = await this.getStory(storyId);
    if (story) {
      await db.update(stories)
        .set({ likeCount: (story.likeCount || 0) + 1 })
        .where(eq(stories.id, storyId));
    }
  }

  async decrementStoryLikes(storyId: string): Promise<void> {
    const story = await this.getStory(storyId);
    if (story && story.likeCount && story.likeCount > 0) {
      await db.update(stories)
        .set({ likeCount: story.likeCount - 1 })
        .where(eq(stories.id, storyId));
    }
  }

  // Liked stories operations
  async getUserLikedStories(userId: string): Promise<Story[]> {
    const result = await db
      .select({
        id: stories.id,
        title: stories.title,
        summary: stories.summary,
        moral: stories.moral,
        fullContent: stories.fullContent,
        imageUrl: stories.imageUrl,
        ageRange: stories.ageRange,
        language: stories.language,
        isTranslated: stories.isTranslated,
        originalLanguage: stories.originalLanguage,
        sourceType: stories.sourceType,
        authorId: stories.authorId,
        authorName: stories.authorName,
        likeCount: stories.likeCount,
        isPublic: stories.isPublic,
        createdAt: stories.createdAt,
      })
      .from(likedStories)
      .innerJoin(stories, eq(likedStories.storyId, stories.id))
      .where(eq(likedStories.userId, userId))
      .orderBy(desc(likedStories.createdAt));
    
    return result;
  }

  async likeStory(userId: string, storyId: string): Promise<LikedStory> {
    const result = await db.insert(likedStories)
      .values({ userId, storyId })
      .returning();
    return result[0];
  }

  async unlikeStory(userId: string, storyId: string): Promise<void> {
    await db.delete(likedStories)
      .where(and(
        eq(likedStories.userId, userId),
        eq(likedStories.storyId, storyId)
      ));
  }

  async isStoryLiked(userId: string, storyId: string): Promise<boolean> {
    const result = await db.select().from(likedStories)
      .where(and(
        eq(likedStories.userId, userId),
        eq(likedStories.storyId, storyId)
      ));
    return result.length > 0;
  }

  // Dismissed stories operations
  async getUserDismissedStories(userId: string): Promise<Story[]> {
    const result = await db
      .select({
        id: stories.id,
        title: stories.title,
        summary: stories.summary,
        moral: stories.moral,
        fullContent: stories.fullContent,
        imageUrl: stories.imageUrl,
        ageRange: stories.ageRange,
        language: stories.language,
        isTranslated: stories.isTranslated,
        originalLanguage: stories.originalLanguage,
        sourceType: stories.sourceType,
        authorId: stories.authorId,
        authorName: stories.authorName,
        likeCount: stories.likeCount,
        isPublic: stories.isPublic,
        createdAt: stories.createdAt,
      })
      .from(dismissedStories)
      .innerJoin(stories, eq(dismissedStories.storyId, stories.id))
      .where(eq(dismissedStories.userId, userId))
      .orderBy(desc(dismissedStories.createdAt));
    
    return result;
  }

  async dismissStory(userId: string, storyId: string): Promise<DismissedStory> {
    const result = await db.insert(dismissedStories)
      .values({ userId, storyId })
      .returning();
    return result[0];
  }

  async restoreStory(userId: string, storyId: string): Promise<void> {
    await db.delete(dismissedStories)
      .where(and(
        eq(dismissedStories.userId, userId),
        eq(dismissedStories.storyId, storyId)
      ));
  }

  async isStoryDismissed(userId: string, storyId: string): Promise<boolean> {
    const result = await db.select().from(dismissedStories)
      .where(and(
        eq(dismissedStories.userId, userId),
        eq(dismissedStories.storyId, storyId)
      ));
    return result.length > 0;
  }

  async getUserDismissedStoryIds(userId: string): Promise<string[]> {
    const result = await db
      .select({ storyId: dismissedStories.storyId })
      .from(dismissedStories)
      .where(eq(dismissedStories.userId, userId));
    
    return result.map(r => r.storyId);
  }
}

export const storage = new DbStorage();
