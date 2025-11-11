# Bedtime Story Discovery App

## Overview
A mobile-first web application for discovering and creating bedtime stories for children. It features a TikTok-style vertical swipe feed, AI-powered story generation, and personalized filtering. The app supports English and French and aims to provide an engaging platform for parents to find, save, and create custom stories tailored to their children's age, language, and preferences, utilizing a rich library of both classical and AI-generated content.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX
- **Design Philosophy**: Mobile-first responsive design with a bedtime theme, using a deep teal for nighttime sky elements and golden yellow for warm story elements.
- **Components**: Full-screen story cards with a paper-like, minimalist design, off-white backgrounds, larger titles, and optimized typography (Merriweather for content, Inter for UI) for readability. Includes a sticky filter bar and bottom navigation.
- **Branding**: "Story Scroll" logotype with a sleeping scroll character logo, integrated into the AuthScreen and a branded header bar using the logo's color palette.
- **Interaction**: TikTok-style vertical swipe for story browsing. Loading spinners with minimum display times provide user feedback during filter changes. End-of-feed messages indicate when no more stories are available.
- **Onboarding**: Enhanced `AuthScreen` and a dismissible `FeedWelcomeBanner` introduce new users to the app's purpose and core features. Both use unified intro messaging: "Story Scroll helps parents discover the perfect bedtime story. Browse hundreds of classic tales, create custom AI-powered stories for your child, and share your favorites with other parents. Filter by age and language to find exactly what you need."

### Technical Implementation
- **Frontend**: React with TypeScript (Vite), shadcn/ui (Radix UI primitives), Tailwind CSS. State managed with TanStack React Query (server state/API caching) and React Context API (authentication). Wouter for client-side routing.
- **Backend**: Express.js with TypeScript (Node.js), RESTful API with JSON format. Session-based authentication using `express-session`, `bcrypt` for password hashing, and protected route middleware.
- **Data Layer**: `IStorage` abstraction, Drizzle ORM for PostgreSQL, Repository pattern.
- **Authentication**: Supports anonymous browsing for core features; authenticated users can like, save, create AI stories, and manage profiles.
- **Story Management**: Users can edit AI-generated stories before publishing, set privacy (public/private), and manage their stories in a "My Stories" section. Search includes user-generated public and private stories.
- **AI-Powered Content**: AI generates custom stories (title, summary, moral, full content) with summaries capped at 70 words/390 characters. AI also categorizes stories by age group (2-4, 5-6, 7-8 years) based on content analysis, and provides bidirectional French ↔ English translation with deduplication. Specialized AI pipelines generate age-specific stories to balance content distribution across age groups. Age ranges are specifically targeted for bedtime storytelling (2-8 years old), as children 9+ typically read independently and 0-2 year olds don't yet understand story narratives.
- **Age Range Migration**: Updated age ranges from (0-2, 3-5, 6-10) to (2-4, 5-6, 7-8 years) in Nov 2025. Multi-range compatibility layer in `server/routes.ts` maps new filters to legacy database values: "2-4 years"→["0-2", "3-5"], "5-6 years"→["3-5", "6-10"], "7-8 years"→["6-10"]. Storage layer supports both single and array age range queries via `inArray()`. This ensures existing stories remain accessible while migration script (`server/recategorize-stories.ts`) can run later.
- **Error Handling**: Centralized frontend utility (`normalizeErrorMessage`) ensures user-friendly error messages, preventing raw JSON or "[object Object]" displays. Backend consistently returns `{ error: "string message" }` for all error responses.
- **Database Initialization**: Automatically populates with a curated library of AI-generated classical bedtime stories (English and French) on startup.

### Feature Specifications
- **Public Features**: Browse feed, search, read stories, filter by age and language.
- **Protected Features**: Like/save stories, dismiss/restore stories, create AI stories, manage profile.
- **Multi-language Support**: Stories available in English and French, with metadata tracking translation status and original language. Language selectors are integrated across the application.
- **Story Attribution**: Unified "Author:" label displays actual author/source names for all stories (e.g., "Brothers Grimm," "StoryScroll Team").

### System Design Choices
- **Database Schema**:
    - `users`: Stores authentication details (username, hashed password) and preferences (language, age range).
    - `stories`: Contains story content (title, summary, moral, fullContent, imageUrl), metadata (ageRange, language, isTranslated, originalLanguage), source tracking, and engagement metrics (likeCount). Uses UUID primary keys.
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