# Bedtime Story Discovery App

## Overview
A mobile-first web application for discovering and creating bedtime stories for children. It features a TikTok-style vertical swipe feed, AI-powered story generation, and language-based filtering. The app supports English, French, and German and aims to provide an engaging platform for parents to find, save, and create custom stories tailored to their children's language preferences, utilizing a rich library of both classical and AI-generated content.

**Note (Nov 2025)**: Age range filtering has been removed from the app due to poor AI categorization results (113/120 stories categorized as "5-6 years"). The app now filters stories by language only, allowing parents to browse all stories regardless of age appropriateness and make their own judgments.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX
- **Design Philosophy**: Mobile-first responsive design with a bedtime theme, using a deep teal for nighttime sky elements and golden yellow for warm story elements.
- **Components**: Full-screen story cards with a paper-like, minimalist design, off-white backgrounds, larger titles, and optimized typography (Merriweather for content, Inter for UI) for readability. Includes a sticky filter bar and bottom navigation.
- **Branding**: "Story Scroll" logotype with a sleeping scroll character logo, integrated into the AuthScreen and a branded header bar using the logo's color palette.
- **Interaction**: TikTok-style vertical swipe for story browsing. Loading spinners with minimum display times provide user feedback during filter changes. End-of-feed messages indicate when no more stories are available.
- **Onboarding**: Enhanced `AuthScreen` and a dismissible `FeedWelcomeBanner` introduce new users to the app's purpose and core features. Both use unified intro messaging: "Story Scroll helps parents discover the perfect bedtime story. Browse hundreds of classic tales, create custom AI-powered stories for your child, and share your favorites with other parents. Filter by language to find exactly what you need."

### Technical Implementation
- **Frontend**: React with TypeScript (Vite), shadcn/ui (Radix UI primitives), Tailwind CSS. State managed with TanStack React Query (server state/API caching) and React Context API (authentication). Wouter for client-side routing.
- **Backend**: Express.js with TypeScript (Node.js), RESTful API with JSON format. Session-based authentication using `express-session`, `bcrypt` for password hashing, and protected route middleware.
- **Data Layer**: `IStorage` abstraction, Drizzle ORM for PostgreSQL, Repository pattern.
- **Authentication**: Supports anonymous browsing for core features; authenticated users can like, save, create AI stories, and manage profiles.
- **Story Management**: Users can edit AI-generated stories before publishing, set privacy (public/private), and manage their stories in a "My Stories" section. Search includes user-generated public and private stories.
- **AI-Powered Content**: AI generates custom stories (title, summary, moral, full content) with summaries capped at 70 words/390 characters. AI provides bidirectional French ↔ English translation with deduplication.
- **Age Range Removal (Nov 2025)**: Age range filtering and categorization have been completely removed from the application due to poor AI categorization (113/120 stories were categorized as "5-6 years"). Database schema no longer includes `ageRange` columns in `stories` or `users` tables. Stories are now filtered by language only. The legacy generation scripts in `server/seed-session*` and `server/story-processor.ts` still reference age categorization but are no longer used for the live application.
- **Error Handling**: Centralized frontend utility (`normalizeErrorMessage`) ensures user-friendly error messages, preventing raw JSON or "[object Object]" displays. Backend consistently returns `{ error: "string message" }` for all error responses.
- **Story Interleaving**: Deterministic round-robin algorithm (`interleaveStoriesByAuthor` in `server/routes.ts`) spreads out stories from the same author to prevent consecutive stories from appearing back-to-back. Groups stories by author (using authorName, authorId, or story.id as fallback), sorts author groups by size (descending) and name (alphabetically), then interleaves using round-robin. The algorithm is deterministic - same input produces same output every time, ensuring stable feed order across requests and enabling future pagination support.
- **Classical Story Library**: Comprehensive tri-lingual library of 120 bedtime stories (90 classical adaptations + 30 AI-original):
    - **English**: 30 classical (Carroll, Baum, Grimm, Perrault, Arabian Nights) + 10 AI-original
    - **French**: 30 classical (Perrault, d'Aulnoy, de Beaumont, La Fontaine) + 10 AI-original  
    - **German**: 30 classical (Brothers Grimm collection) + 10 AI-original
  - AI creates bedtime-appropriate adaptations of classical stories while preserving their essence
  - All stories attributed with "adapted from [Original Author]" or "StoryScroll Team"
  - AI categorizes each story by age (2-4, 5-6, 7-8 years) based on complexity analysis
  - AI generates age-appropriate morals for all stories (gentle for younger, stronger for older)
- **Story Generation Pipeline**: 
    - `server/classicalStoryData.ts`: Metadata for 90 classical stories with descriptions
    - `server/story-processor.ts`: AI adaptation, age categorization, and moral generation
    - **Chunked Generation Scripts** (designed for short execution time limits on some hosts):
      - `server/seed-session1a-english.ts` + `seed-session1b-english.ts`: 30 English classics
      - `server/seed-session2a-french.ts` + `seed-session2b-french.ts`: 30 French classics
      - `server/seed-session3a-german.ts` + `seed-session3b-german.ts`: 30 German classics
      - `server/seed-session4a-originals.ts` + `seed-session4b-originals.ts`: 30 AI-original stories
    - Each session processes 15 stories with immediate database insertion to preserve progress
    - See `server/ADD_MORE_STORIES.md` for instructions on adding more classical stories
- **Database Status**: ✅ **GENERATION COMPLETE** (Nov 2025)
    - All 120 bedtime stories successfully generated and stored in database
    - 40 English stories (30 classics + 10 AI-originals)
    - 40 French stories (30 classics + 10 AI-originals)
    - 40 German stories (30 classics + 10 AI-originals)
    - Total cost: ~$3-5 in OpenAI API usage
    - **Note**: Age range metadata was removed from the database in Nov 2025. To regenerate stories, clear database first with `DELETE FROM stories;` to avoid duplicates

### Feature Specifications
- **Public Features**: Browse feed, search, read stories, filter by language.
- **Protected Features**: Like/save stories, dismiss/restore stories, create AI stories, manage profile.
- **Multi-language Support**: Stories available in English, French, and German, with metadata tracking translation status and original language. Language selectors are integrated across the application.
- **Story Attribution**: Unified "Author:" label displays actual author/source names for all stories (e.g., "Brothers Grimm," "StoryScroll Team").

### System Design Choices
- **Database Schema**:
    - `users`: Stores authentication details (username, hashed password) and preferences (language only - age range removed Nov 2025).
    - `stories`: Contains story content (title, summary, moral, fullContent, imageUrl), metadata (language, isTranslated, originalLanguage), source tracking, and engagement metrics (likeCount). Uses UUID primary keys. **Note**: `ageRange` column removed Nov 2025.
    - `likedStories`: Junction table for user-liked stories (`userId`, `storyId`).
    - `dismissedStories`: Junction table for tracking user-dismissed stories (`userId`, `storyId`).
- **Performance**: Denormalized `likeCount` for faster queries.
- **Scalability**: Drizzle ORM with Neon serverless PostgreSQL for robust data management.

## External Dependencies

- **AI Service**: OpenAI API (for story generation and summarization).
- **Database**: Neon Serverless PostgreSQL (configured via `DATABASE_URL`).
- **UI Components**: Radix UI primitives, shadcn/ui, Lucide React (icons).
- **Session Storage**: `connect-pg-simple` (for PostgreSQL-backed session persistence).
- **Image Hosting**: Unsplash (currently for placeholders, not actively displayed in UI).

## Local Setup (.env + Neon)

Use a local `.env` file and a Neon-hosted PostgreSQL database for development.

1) Prerequisites
- Node 18.18+ or 20.9+ and npm installed
- Install dependencies: `npm install`

2) Provision a Neon database
- Create a free project/database at Neon and copy the connection string that includes SSL, e.g. `postgres://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require`
- In Neon → SQL Editor, enable UUID generation used by the schema:
  - `CREATE EXTENSION IF NOT EXISTS pgcrypto;`

3) Create a `.env` at the project root
```
DATABASE_URL=postgres://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require
SESSION_SECRET=replace-with-a-long-random-string
# Optional – only needed for AI features
# OPENAI_API_KEY=sk-...
```
Notes:
- `.env` is git-ignored
- The app and Drizzle auto-load `.env` via `dotenv` imports in `server/index.ts`, `server/db.ts`, and `drizzle.config.ts`

4) Create tables from the schema
- `npm run db:push` (uses Drizzle to create `users`, `stories`, `liked_stories`, `dismissed_stories`)
- Session storage (`connect-pg-simple`) auto-creates its table on first run

5) Run the app
- Development: `npm run dev`
- Production-like: `npm run build && npm run start`

6) First-run seeding
- On first boot with an empty `stories` table, the server automatically inserts ~120 curated stories
- To reinitialize stories later: `DELETE FROM stories;` then restart the server

Troubleshooting
- `DATABASE_URL must be set`: ensure `.env` exists and contains a valid Neon URL
- `function gen_random_uuid() does not exist`: run `CREATE EXTENSION IF NOT EXISTS pgcrypto;` in Neon
- Connection issues: make sure the Neon URL includes `?sslmode=require`
