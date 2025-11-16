import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { neon } from "@neondatabase/serverless";
import { insertStorySchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import bcrypt from "bcryptjs";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session store with PostgreSQL
  const PgStore = connectPgSimple(session);
  const sessionStore = new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  });

  // Session middleware
  const cookieSecureEnv = process.env.SESSION_COOKIE_SECURE;
  const cookieSecure = typeof cookieSecureEnv === 'string'
    ? cookieSecureEnv.toLowerCase() === 'true'
    : process.env.NODE_ENV === "production";

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "bedtime-stories-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 6, // 6 days as requested
        httpOnly: true,
        secure: cookieSecure,
        sameSite: "lax",
      },
    })
  );

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({ 
        username, 
        password: hashedPassword,
        email: email || null,
        preferredLanguage: "en"
      });

      req.session.userId = user.id;
      
      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      req.session.userId = user.id;
      
      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Deterministically interleave stories to avoid consecutive stories from the same author
  // This uses a round-robin approach that is stable across requests (no random shuffling)
  function interleaveStoriesByAuthor(stories: any[]): any[] {
    if (stories.length <= 1) return stories;
    
    // Group stories by author, using story ID as fallback to prevent "unknown" clumping
    const byAuthor = new Map<string, any[]>();
    for (const story of stories) {
      const author = story.authorName || story.authorId || story.id;
      if (!byAuthor.has(author)) {
        byAuthor.set(author, []);
      }
      byAuthor.get(author)!.push(story);
    }
    
    // Convert to array with author name for deterministic sorting
    const authorData: Array<{ author: string; stories: any[] }> = [];
    const authorEntries = Array.from(byAuthor.entries());
    for (const [author, authorStories] of authorEntries) {
      if (authorStories.length > 0) {
        authorData.push({ author, stories: authorStories });
      }
    }
    
    // Sort deterministically by recency: the most recently created story in each author's queue
    // comes first, then by author name as a tie-breaker. This prioritizes fresh content while
    // still interleaving different authors.
    authorData.sort((a, b) => {
      const aTop = a.stories[0];
      const bTop = b.stories[0];
      const aTime = aTop?.createdAt ? new Date(aTop.createdAt).getTime() : 0;
      const bTime = bTop?.createdAt ? new Date(bTop.createdAt).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime; // newer first
      // Tie-break by newest story id (descending) for stable order
      const aId = aTop?.id || "";
      const bId = bTop?.id || "";
      if (aId !== bId) return bId.localeCompare(aId);
      // Final tie-breaker by author
      return a.author.localeCompare(b.author);
    });
    
    const authorQueues = authorData.map(d => d.stories);
    
    // Round-robin interleave: pick one story from each author in rotation
    const result: any[] = [];
    let queueIndex = 0;
    
    while (authorQueues.length > 0) {
      // Get next queue in round-robin fashion
      const queue = authorQueues[queueIndex % authorQueues.length];
      
      // Take the first story from this author's queue
      const story = queue.shift();
      if (story) {
        result.push(story);
      }
      
      // Remove empty queues
      if (queue.length === 0) {
        authorQueues.splice(queueIndex % authorQueues.length, 1);
        // Don't increment index when we remove a queue
      } else {
        queueIndex++;
      }
    }
    
    return result;
  }

  // Story routes
  app.get("/api/stories", async (req, res) => {
    try {
      const { language } = req.query;
      const userId = req.session.userId;
      
      // Get dismissed story IDs for authenticated users to exclude from feed
      let excludeIds: string[] = [];
      if (userId) {
        excludeIds = await storage.getUserDismissedStoryIds(userId);
      }

      // Get public stories
      const publicStories = await storage.getStories({
        language: language as string,
        isPublic: true,
        excludeIds,
      });

      // If authenticated and no filters applied, also include user's own private stories for search
      let userStories: any[] = [];
      if (userId && !language) {
        userStories = await storage.getUserStories(userId);
        // Filter out stories that are already in public stories
        const publicIds = new Set(publicStories.map(s => s.id));
        userStories = userStories.filter(s => !publicIds.has(s.id));
      }

      let stories = [...publicStories, ...userStories];
      
      // Interleave stories to spread out stories from the same author (deterministic)
      stories = interleaveStoriesByAuthor(stories);
      
      res.json({ stories });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's own stories (MUST be before /api/stories/:id to avoid route collision)
  app.get("/api/stories/mine", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const stories = await storage.getUserStories(userId);
      res.json({ stories });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const story = await storage.getStory(req.params.id);
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      res.json({ story });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stories", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      const validatedData = insertStorySchema.parse({
        ...req.body,
        authorId: userId,
        authorName: user?.username,
      });

      // Check if author already has a story with this title
      const existingStory = await storage.getStoryByAuthorAndTitle(userId, validatedData.title);
      if (existingStory) {
        return res.status(400).json({ 
          error: "You already have a story with this title. Please choose a different title." 
        });
      }

      const story = await storage.createStory(validatedData);
      res.json({ story });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors into a readable message
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ error: `Validation error: ${messages}` });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update a user's story
  app.patch("/api/stories/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const storyId = req.params.id;

      // Get story to verify ownership
      const existingStory = await storage.getStory(storyId);
      if (!existingStory) {
        return res.status(404).json({ error: "Story not found" });
      }

      if (existingStory.authorId !== userId) {
        return res.status(403).json({ error: "You can only edit your own stories" });
      }

      const validatedData = insertStorySchema.partial().parse(req.body);
      const updatedStory = await storage.updateStory(storyId, validatedData);
      
      res.json({ story: updatedStory });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ error: `Validation error: ${messages}` });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a user's story
  app.delete("/api/stories/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const storyId = req.params.id;

      // Get story to verify ownership
      const existingStory = await storage.getStory(storyId);
      if (!existingStory) {
        return res.status(404).json({ error: "Story not found" });
      }

      if (existingStory.authorId !== userId) {
        return res.status(403).json({ error: "You can only delete your own stories" });
      }

      await storage.deleteStory(storyId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stories/generate", requireAuth, async (req, res) => {
    try {
      const { theme, language, generateMoral } = req.body;
      
      if (!theme || !language) {
        return res.status(400).json({ 
          error: "Theme and language are required" 
        });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const languageNames: Record<string, string> = {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
      };
      const languageName = languageNames[language] || "English";

      const storyPrompt = `Write a bedtime story in ${languageName} for children about: ${theme}

The story should be:
- Age-appropriate and engaging for children
- Around 200-400 words long
- Have a clear beginning, middle, and end
- Be calming and suitable for bedtime
${generateMoral ? "- Include a gentle moral or lesson" : ""}

Return the response in this exact JSON format:
{
  "title": "Story title here",
  "content": "Full story text here",
  "summary": "A concise, engaging summary of the story (maximum 70 words or 390 characters with spaces). Capture the key plot points and main characters in a warm, inviting way",
  "moral": "${generateMoral ? "A brief moral of the story" : ""}"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a creative storyteller who writes engaging bedtime stories for children. Always respond with valid JSON."
          },
          {
            role: "user",
            content: storyPrompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error("No response from OpenAI");
      }

      const storyData = JSON.parse(responseText);

      res.json({
        story: {
          title: storyData.title,
          fullContent: storyData.content,
          summary: storyData.summary,
          moral: generateMoral ? storyData.moral : null,
          language,
        }
      });
    } catch (error: any) {
      console.error("AI generation error:", error);
      
      // Handle OpenAI-specific errors
      if (error.status === 429 || error.code === 'insufficient_quota') {
        return res.status(503).json({ 
          error: "AI service is currently unavailable. Please try again later or contact support if this persists." 
        });
      }
      
      if (error.status === 401 || error.code === 'invalid_api_key') {
        return res.status(503).json({ 
          error: "AI service configuration error. Please contact support." 
        });
      }
      
      // Generic error handling
      res.status(500).json({ 
        error: "Failed to generate story. Please try again later." 
      });
    }
  });

  // Admin endpoint: Add story with automatic categorization and translation
  app.post("/api/stories/add-with-translation", requireAuth, async (req, res) => {
    try {
      const {
        title,
        author,
        language,
        fullContent,
        translateToOtherLanguage = true
      } = req.body;

      if (!title || !author || !language || !fullContent) {
        return res.status(400).json({
          error: "Title, author, language, and full content are required"
        });
      }

      // Import AI helpers dynamically
      const { categorizeStory, translateStory } = await import("./aiStoryHelpers");

      // Step 1: Generate summary and moral using AI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const summaryPrompt = `Based on this bedtime story, create a concise summary (max 70 words or 390 characters) and extract the moral lesson if present.

Title: ${title}
Content: ${fullContent}

Respond in JSON format:
{
  "summary": "Engaging summary (max 70 words)",
  "moral": "Moral lesson or empty string if none"
}`;

      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: summaryPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      const summaryData = JSON.parse(summaryResponse.choices[0]?.message?.content || "{}");

      // Step 2: Save the original story
      const imageUrl = `https://images.unsplash.com/photo-1516416615694-856c1e7a4ba7?w=400`;

      const originalStory = await storage.createStory({
        title,
        summary: summaryData.summary,
        moral: summaryData.moral || null,
        fullContent,
        imageUrl,
        language,
        isTranslated: false,
        originalLanguage: language,
        sourceType: "curated",
        authorName: author,
        authorId: null,
        isPublic: true,
      });

      console.log(`✅ Added story: ${title}`);

      // Step 3: Translate to other language if requested
      let translatedStory = null;
      if (translateToOtherLanguage) {
        const targetLang = language === "en" ? "fr" : "en";

        const translation = await translateStory(
          {
            title,
            summary: summaryData.summary,
            moral: summaryData.moral || null,
            fullContent,
          },
          targetLang
        );

        translatedStory = await storage.createStory({
          title: translation.title,
          summary: translation.summary,
          moral: translation.moral || null,
          fullContent: translation.fullContent,
          imageUrl,
          language: targetLang,
          isTranslated: true,
          originalLanguage: language,
          sourceType: "curated",
          authorName: author,
          authorId: null,
          isPublic: true,
        });

        console.log(`✅ Translated to ${targetLang}: ${translation.title}`);
      }

      res.json({
        success: true,
        originalStory,
        translatedStory,
      });
    } catch (error: any) {
      console.error("Failed to add story with translation:", error);
      res.status(500).json({
        error: "Failed to add story. Please try again."
      });
    }
  });

  // Liked stories routes
  app.get("/api/liked-stories", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const stories = await storage.getUserLikedStories(userId);
      res.json({ stories });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/liked-stories/:storyId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { storyId } = req.params;

      const isLiked = await storage.isStoryLiked(userId, storyId);
      if (isLiked) {
        await storage.unlikeStory(userId, storyId);
        await storage.decrementStoryLikes(storyId);
        res.json({ liked: false });
      } else {
        await storage.likeStory(userId, storyId);
        await storage.incrementStoryLikes(storyId);
        res.json({ liked: true });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/liked-stories/:storyId/status", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { storyId } = req.params;
      const liked = await storage.isStoryLiked(userId, storyId);
      res.json({ liked });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dismissed stories routes
  app.get("/api/dismissed-stories", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const stories = await storage.getUserDismissedStories(userId);
      res.json({ stories });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/dismissed-stories/:storyId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { storyId } = req.params;

      // Idempotent: always dismiss (insert ignores duplicates via unique constraint)
      const isDismissed = await storage.isStoryDismissed(userId, storyId);
      if (!isDismissed) {
        await storage.dismissStory(userId, storyId);
      }
      res.json({ dismissed: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/dismissed-stories/:storyId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { storyId } = req.params;

      // Idempotent: always restore (delete is safe even if row doesn't exist)
      await storage.restoreStory(userId, storyId);
      res.json({ dismissed: false });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/dismissed-stories/:storyId/status", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { storyId } = req.params;
      const dismissed = await storage.isStoryDismissed(userId, storyId);
      res.json({ dismissed });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User preferences
  app.patch("/api/users/preferences", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { preferredLanguage } = req.body;
      
      const user = await storage.updateUserPreferences(userId, {
        preferredLanguage
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user profile (username, email, password)
  app.patch("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { username, email, currentPassword, newPassword } = req.body;

      // Get current user
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate password change requirements
      if (currentPassword || newPassword) {
        if (!currentPassword || !newPassword) {
          return res.status(400).json({ 
            error: "Both current password and new password are required to change password" 
          });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({ error: "New password must be at least 6 characters" });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: "Current password is incorrect" });
        }
      }

      const updates: any = {};

      // Update username if provided and different
      if (username !== undefined && username !== currentUser.username) {
        if (!username || username.trim().length === 0) {
          return res.status(400).json({ error: "Username cannot be empty" });
        }
        
        // Check if username is already taken
        const existingUser = await storage.getUserByUsername(username.trim());
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: "Username already taken" });
        }
        updates.username = username.trim();
      }

      // Update email if provided
      if (email !== undefined) {
        updates.email = email && email.trim().length > 0 ? email.trim() : null;
      }

      // Update password if validated
      if (currentPassword && newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updates.password = hashedPassword;
      }

      // Check if there are any updates to make
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No changes to update" });
      }

      // Update user profile
      const updatedUser = await storage.updateUserProfile(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile. Please try again." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
