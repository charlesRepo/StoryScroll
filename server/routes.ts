import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
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
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "bedtime-stories-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
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
        preferredLanguage: "en",
        preferredAgeRange: "3-5 years"
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

  // Story routes
  app.get("/api/stories", async (req, res) => {
    try {
      const { language, ageRange } = req.query;
      
      // Get dismissed story IDs for authenticated users to exclude from feed
      let excludeIds: string[] = [];
      if (req.session.userId) {
        excludeIds = await storage.getUserDismissedStoryIds(req.session.userId);
      }

      const stories = await storage.getStories({
        language: language as string,
        ageRange: ageRange as string,
        isPublic: true,
        excludeIds,
      });

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

      const story = await storage.createStory(validatedData);
      res.json({ story });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stories/generate", requireAuth, async (req, res) => {
    try {
      const { theme, ageRange, language, generateMoral } = req.body;
      
      if (!theme || !ageRange || !language) {
        return res.status(400).json({ 
          error: "Theme, age range, and language are required" 
        });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const ageRangeWords = ageRange === "0-2 years" 
        ? "very young toddlers (0-2 years old)"
        : ageRange === "3-5 years"
        ? "preschool children (3-5 years old)"
        : "early elementary children (6-10 years old)";

      const languageName = {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
      }[language] || "English";

      const storyPrompt = `Write a bedtime story in ${languageName} for ${ageRangeWords} about: ${theme}

The story should be:
- Age-appropriate and engaging
- Around 200-400 words long
- Have a clear beginning, middle, and end
- Be calming and suitable for bedtime
${generateMoral ? "- Include a gentle moral or lesson" : ""}

Return the response in this exact JSON format:
{
  "title": "Story title here",
  "content": "Full story text here",
  "summary": "A brief 1-2 sentence summary",
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
          ageRange,
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
      const { preferredLanguage, preferredAgeRange } = req.body;
      
      const user = await storage.updateUserPreferences(userId, {
        preferredLanguage,
        preferredAgeRange,
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
