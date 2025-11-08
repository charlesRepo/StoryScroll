# Bedtime Story Discovery App

## Overview

A mobile-first web application for discovering and creating bedtime stories for children. The app features a TikTok-style vertical swipe feed for browsing stories, AI-powered story generation, and personalized filtering by age range and language. Parents can like stories, save them to their profile, and create custom stories tailored to their child's preferences.

**Core Features:**
- Vertical story feed with age-appropriate filtering (0-2, 3-5, 6-10 years)
- Multi-language support (English, French, Spanish, German)
- AI-powered story generation using OpenAI
- User authentication and personalization
- Profile editing with secure password management
- Story liking and bookmarking
- Search functionality
- Reading time estimation
- Classical bedtime story library from public domain sources

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript using Vite as the build tool

**Design System:**
- Component library: shadcn/ui (Radix UI primitives)
- Styling: Tailwind CSS with custom design tokens
- Typography: Inter (UI elements) and Merriweather (story content) via Google Fonts
- Design inspiration: TikTok (feed mechanics), Duolingo (friendly UI), Instagram (like/save features)

**State Management:**
- TanStack React Query for server state and API caching
- React Context API for authentication state
- Local component state for UI interactions

**Routing:**
- Wouter for lightweight client-side routing
- Single-page application with modal-based story reading

**Key Architectural Decisions:**
- Mobile-first responsive design with bottom navigation
- Full-screen story cards optimized for bedtime reading
- Sticky filter bar for quick age/language switching
- Modal-based story reader to maintain feed position

### Backend Architecture

**Framework:** Express.js with TypeScript running on Node.js

**API Design:**
- RESTful API architecture
- Session-based authentication using express-session
- JSON request/response format
- Credential-based fetch requests for session management

**Data Layer:**
- Storage abstraction interface (`IStorage`) for database operations
- Drizzle ORM for type-safe database queries
- Repository pattern separating business logic from data access

**Authentication:**
- bcrypt for password hashing
- Session middleware with secure cookie configuration
- Protected route middleware for authenticated endpoints

**Key Routes:**
- `/api/auth/*` - User authentication (signup, login, logout)
- `/api/stories` - Story CRUD operations with filtering
- `/api/liked-stories` - User's saved stories
- `/api/users/preferences` - User preference updates
- `/api/users/profile` - Update user profile (username, email, password)
- `/api/stories/generate` - AI story generation endpoint

### Database Design

**ORM:** Drizzle with PostgreSQL dialect (Neon serverless)

**Schema:**

**users table:**
- Authentication: username (unique), password (hashed)
- Preferences: preferredLanguage, preferredAgeRange
- Email optional for future features

**stories table:**
- Content: title, summary, moral, fullContent, imageUrl
- Metadata: ageRange, language, isTranslated, originalLanguage
- Source tracking: sourceType (curated/user-shared), authorId, authorName
- Engagement: likeCount, isPublic flag
- UUID primary keys with automatic generation

**likedStories table:**
- Junction table for user-story many-to-many relationship
- Foreign keys to users and stories with cascading

**Design Decisions:**
- Denormalized likeCount for performance (avoids COUNT queries on feed)
- Separate sourceType field to distinguish curated vs user-generated content
- isTranslated flag to support multi-language content expansion
- isPublic flag for future privacy features

### External Dependencies

**AI Service:**
- OpenAI API for story generation
- Used for creating custom bedtime stories based on themes, age ranges, and languages
- Generates title, summary, moral lesson, and full story content

**Database:**
- Neon Serverless PostgreSQL
- WebSocket-based connection pooling for serverless environments
- Configured via DATABASE_URL environment variable

**UI Components:**
- Radix UI primitives (@radix-ui/*) for accessible component foundation
- shadcn/ui configuration for consistent design system
- Lucide React for icons

**Development Tools:**
- Replit-specific plugins for runtime error overlay and dev tooling
- TypeScript for type safety across frontend and backend
- ESBuild for production server bundling

**Session Storage:**
- connect-pg-simple for PostgreSQL-backed session storage
- Enables persistent sessions across server restarts

**Image Hosting:**
- Unsplash for curated story images (placeholder)
- Future: Support for AI-generated images or user uploads

## Recent Changes

### Profile Editing Feature (November 2025)
Added comprehensive profile editing functionality:
- Users can update username, email, and password via SettingsDialog
- Password changes require current password verification for security
- All password updates use bcrypt hashing (10 rounds)
- Proper validation for username uniqueness and password strength (min 6 characters)
- Backend endpoint: PATCH `/api/users/profile`

### Classical Bedtime Stories (November 2025)
Integrated curated collection of classical public domain bedtime stories:
- **Total Stories**: 16 (6 original sample stories + 10 classical tales)
- **English**: Hansel and Gretel, Cinderella, Little Red Riding Hood, The Three Little Pigs
- **French**: Le Petit Chaperon Rouge (Little Red Riding Hood), Cendrillon (Cinderella)
- **German**: Hänsel und Gretel, Schneewittchen (Snow White)
- **Spanish**: Los Tres Cerditos (Three Little Pigs), Caperucita Roja (Little Red Riding Hood)

**Sources:**
- Brothers Grimm (German fairy tales)
- Charles Perrault (French fairy tales)
- Traditional English tales

**Translation Metadata:**
- Stories properly flagged with `isTranslated` field
- Original language tracked in `originalLanguage` field
- Enables future features for showing original vs translated content

**Implementation:**
- Stories curated in `server/classical-stories.ts`
- Added to database via seed script `server/seed.ts`
- All stories include: title, summary, moral lesson, full content, age range, language, author attribution