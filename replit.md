# Bedtime Story Discovery App

## Overview
A mobile-first web application designed for discovering and creating bedtime stories for children. The app features a TikTok-style vertical swipe feed for browsing, AI-powered story generation, and personalized filtering. Its purpose is to provide an engaging platform where parents can find, save, and create custom stories tailored to their children's age, language, and preferences, leveraging a rich library of both classical and AI-generated content.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite).
- **Design System**: shadcn/ui (Radix UI primitives) and Tailwind CSS with custom design tokens. Typography uses Inter (UI) and Merriweather (story content).
- **State Management**: TanStack React Query for server state/API caching; React Context API for authentication; local component state for UI.
- **Routing**: Wouter for lightweight client-side routing, enabling a single-page application with modal-based story reading.
- **Key Decisions**: Mobile-first responsive design, full-screen story cards, sticky filter bar, bottom navigation. Story cards feature a paper-like, minimalist design with off-white background, larger titles, and optimized typography for readability.

### Backend
- **Framework**: Express.js with TypeScript (Node.js).
- **API Design**: RESTful API, JSON format, session-based authentication using `express-session`.
- **Data Layer**: `IStorage` abstraction, Drizzle ORM for type-safe PostgreSQL queries, Repository pattern.
- **Authentication**: Optional authentication (anonymous browsing allowed), `bcrypt` for password hashing, secure cookie configuration, protected route middleware. Authentication is required for interactive features like liking, creating stories, and profile management.
- **Public Features**: Browse feed, search, read stories, filter.
- **Protected Features**: Like/save, dismiss/restore, create AI stories, manage profile.

### Database
- **ORM**: Drizzle with PostgreSQL dialect (Neon serverless).
- **Schema**:
    - `users`: Authentication (username, hashed password), preferences (language, age range).
    - `stories`: Content (title, summary, moral, fullContent, imageUrl), metadata (ageRange, language, isTranslated, originalLanguage), source tracking, engagement (likeCount). UUID primary keys.
    - `likedStories`: Junction table (userId, storyId).
    - `dismissedStories`: Junction table for tracking dismissed stories (userId, storyId).
- **Decisions**: Denormalized `likeCount` for performance, `sourceType` for content categorization, `isTranslated` and `originalLanguage` for multi-language support.
- **Initialization**: Automatic database population on startup with a curated library of 51 classical stories (English, French, German, Spanish) and sample stories, ensuring a rich content base for new deployments.

## External Dependencies

- **AI Service**: OpenAI API for generating custom bedtime stories (title, summary, moral, full content). Summaries limited to 70 words or 390 characters for optimal mobile readability.
- **Database**: Neon Serverless PostgreSQL, configured via `DATABASE_URL`.
- **UI Components**: Radix UI primitives, shadcn/ui, Lucide React (icons).
- **Session Storage**: `connect-pg-simple` for PostgreSQL-backed session persistence.
- **Image Hosting**: Unsplash (placeholders), with future plans for AI-generated or user-uploaded images.

## Recent Changes

### Story Summary & Title Optimization (November 2025)
Optimized story presentation for better mobile readability:
- **Title Font-Size**: Reduced from 36px to 32px for better visual balance
- **Summary Length**: Capped at 70 words or 390 characters (displays 4-5 lines on mobile)
- **Updated Stories**: Revised 10 popular English stories (Hansel and Gretel, Cinderella, Little Red Riding Hood, The Three Little Pigs, The Ugly Duckling, Goldilocks, Jack and the Beanstalk, The Golden Goose, Puss in Boots, Sleeping Beauty)
- **AI Generation**: Updated prompt to enforce summary length limits for all new stories
- **Result**: Clean, readable cards that provide quick story context without overwhelming the screen