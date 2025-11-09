# Bedtime Story Discovery App

## Overview

A mobile-first web application for discovering and creating bedtime stories for children. The app features a TikTok-style vertical swipe feed for browsing stories, AI-powered story generation, and personalized filtering by age range and language. Parents can like stories, save them to their profile, and create custom stories tailored to their child's preferences.

**Core Features:**
- **Anonymous browsing**: Browse and search stories without signing up
- Vertical story feed with age-appropriate filtering (0-2, 3-5, 6-10 years)
- Multi-language support (English, French, Spanish, German)
- AI-powered story generation using OpenAI (requires login)
- Optional user authentication for personalization and saved stories
- Profile editing with secure password management
- Story liking and bookmarking (requires login)
- Story dismissal with undo functionality (requires login)
- Search functionality (available to all users)
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
- **Optional authentication model**: Users can browse stories anonymously
- Authentication required only for interactive features (liking, creating, profile)
- bcrypt for password hashing
- Session middleware with secure cookie configuration
- Protected route middleware for authenticated endpoints

**Public vs Protected Features:**
- **Public (No Auth Required)**:
  - Browse story feed
  - Search stories
  - Read full story content
  - Filter by age and language
- **Protected (Auth Required)**:
  - Like/save stories
  - Dismiss/restore stories
  - Create custom AI stories
  - View liked stories collection
  - View dismissed stories collection
  - Access user profile and preferences

**Key Routes:**
- `/api/auth/*` - User authentication (signup, login, logout)
- `/api/stories` (GET) - **Public** - Story browsing with filtering
- `/api/stories/:id` (GET) - **Public** - Individual story details
- `/api/stories` (POST) - **Protected** - Create story
- `/api/stories/generate` (POST) - **Protected** - AI story generation
- `/api/liked-stories` (GET) - **Protected** - User's saved stories
- `/api/liked-stories/:id` (POST) - **Protected** - Like/unlike story
- `/api/dismissed-stories` (GET) - **Protected** - User's dismissed stories
- `/api/dismissed-stories/:id` (POST) - **Protected** - Dismiss story (idempotent)
- `/api/dismissed-stories/:id` (DELETE) - **Protected** - Restore story (idempotent)
- `/api/users/preferences` (PATCH) - **Protected** - User preference updates
- `/api/users/profile` (PATCH) - **Protected** - Update user profile

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

**dismissedStories table:**
- Junction table for user-story many-to-many relationship
- Tracks stories users have dismissed from their feed
- Foreign keys to users and stories with cascading
- Composite unique constraint on (userId, storyId)

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
- 6-day cookie duration for better user experience

**Image Hosting:**
- Unsplash for curated story images (placeholder)
- Future: Support for AI-generated images or user uploads

## Recent Changes

### Bug Fixes (November 2025)
Fixed several critical bugs to improve user experience:
- **Production Deployment Fixes**: Added trust proxy for session cookies
  - `app.set("trust proxy", 1)` allows secure cookies behind HTTPS proxy
  - Fixes 401 Unauthorized errors on profile updates in production
  - Sessions work properly in production environment
- **Session Persistence**: Added PostgreSQL session store using connect-pg-simple
  - Sessions now persist across server restarts
  - Cookie duration extended to 6 days as requested
  - Fixes 401 Unauthorized errors on profile updates in development
- **Search Improvements**: Fixed search to handle multi-word queries correctly
  - Direct string match with spaces checked first (e.g., "Three Little Pigs")
  - Falls back to fuzzy matching for typos and partial matches
  - Search icon layout fixed to prevent wrapping on narrow viewports
  - Added `w-full max-w-full` constraints and `pointer-events-none` to icon
- **Scrolling Viewport**: Fixed card visibility when scrolling
  - Changed from fixed-height scroll to scrollIntoView API
  - Cards always fully visible whether scrolling up or down
  - Added scrollSnapStop for smoother snap behavior
- **Password Change UX**: Improved password change experience
  - Moved password change to separate ChangePasswordDialog
  - Settings dialog now focused on username/email only
  - "Change Password" button opens dedicated dialog
  - Better UX separation of concerns

### Story Dismissal Feature (November 2025)
Implemented story dismissal with undo functionality:
- Users can dismiss stories from feed using X button on story cards
- Toast notification appears with Undo button for quick restoration
- Dismissed stories section in Profile tab (collapsible) to view and restore dismissed stories
- Race condition fixed using separate idempotent endpoints:
  - POST `/api/dismissed-stories/:id` → always dismiss (idempotent)
  - DELETE `/api/dismissed-stories/:id` → always restore (idempotent)
- Per-story pending state tracking prevents overlapping mutations
- SQL-level filtering excludes dismissed stories from main feed
- Database table: dismissedStories (userId, storyId junction)
- All endpoints properly authenticated and protected
- E2E tested including rapid click scenarios

### Profile Editing Feature (November 2025)
Added comprehensive profile editing functionality:
- Users can update username, email, and password via SettingsDialog
- Password changes require current password verification for security
- All password updates use bcrypt hashing (10 rounds)
- Proper validation for username uniqueness and password strength (min 6 characters)
- Backend endpoint: PATCH `/api/users/profile`

### Classical Bedtime Stories & Auto-Initialization (November 2025)
**Story Library Expansion:**
Expanded the classical bedtime stories collection to provide a rich, diverse library:
- **Total Stories**: 51 stories (6 sample stories + 45 classical tales)
- **Distribution**: Well-balanced across all four languages and three age ranges
- **English**: 30 stories including Hansel and Gretel, Cinderella, Little Red Riding Hood, The Three Little Pigs, The Ugly Duckling, Goldilocks, The Emperor's New Clothes, Jack and the Beanstalk, The Gingerbread Man, Rapunzel, The Little Mermaid, Sleeping Beauty, The Princess and the Pea, Thumbelina, The Elves and the Shoemaker, The Bremen Town Musicians, Beauty and the Beast, The Tortoise and the Hare, The Fisherman and His Wife, The Little Match Girl, The Town Mouse and the Country Mouse, The Wolf and the Seven Young Kids, The Golden Goose, Puss in Boots, Aladdin, Ali Baba and the Forty Thieves, The Lion and the Mouse, and more
- **French**: 7 stories including Le Petit Chaperon Rouge, Cendrillon, Le Chat Botté, La Belle au Bois Dormant, Le Vilain Petit Canard, Boucle d'Or et les Trois Ours
- **German**: 7 stories including Hänsel und Gretel, Schneewittchen, Der Froschkönig, Rumpelstilzchen, Rotkäppchen, Aschenputtel
- **Spanish**: 7 stories including Los Tres Cerditos, Caperucita Roja, Blancanieves, La Cenicienta, El Patito Feo, Ricitos de Oro y los Tres Osos

**Sources:**
- Brothers Grimm (German fairy tales)
- Charles Perrault (French fairy tales)
- Hans Christian Andersen (Danish fairy tales)
- Traditional English, French, German, and Spanish tales

**Translation Metadata:**
- Stories properly flagged with `isTranslated` field
- Original language tracked in `originalLanguage` field
- Enables future features for showing original vs translated content

**Auto-Initialization System:**
Implemented automatic database population to ensure production databases have content without manual intervention:
- **Module**: `server/initialize-stories.ts` contains initialization logic
- **Trigger**: Runs automatically on every app startup via `server/index.ts`
- **Behavior**: Checks if stories table is empty; if yes, populates with all sample and classical stories
- **Smart Detection**: Skips initialization if stories already exist (prevents duplicates)
- **Production Ready**: Ensures production database auto-populates on first deployment
- **Maintenance Free**: No manual seed script execution required

**Implementation:**
- Stories curated in `server/classical-stories.ts` (45 classical tales)
- Sample stories defined in `server/initialize-stories.ts` (6 sample stories)
- Auto-initialization integrated into server startup sequence
- All stories include: title, summary, moral lesson, full content, age range, language, author attribution, appropriate images