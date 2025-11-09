# Bedtime Story Discovery App - Requirements Document

## Overview

A mobile-first web application for parents with children under 10 to discover and create bedtime stories. The app features a TikTok-style vertical swipe feed for browsing stories, AI-powered story generation, and personalized filtering by age range and language.

**Target Audience:**
- Parents with children under 10 years old
- Mobile-first design (works on phones, tablets, and desktop)

---

## Feature Requirements

### 1. Story Discovery & Browsing

- **TikTok-style vertical swipe feed** for browsing stories
- **Age-based filtering**: 0-2 years, 3-5 years, 6-10 years
- **Multi-language support**: English, French, German, Spanish
- **Search functionality** to find specific stories
- **Story cards** showing title, summary, age range, language, author, and reading time estimate
- Stories display in full-screen card format optimized for bedtime reading
- Sticky filter bar for quick age/language switching
- Modal-based story reader to maintain feed position

### 2. User Authentication & Accounts

- **Secure password-based authentication** (signup, login, logout)
- **User profiles** with preferences
- **Profile editing**: Update username, email, and password
- Password changes require current password verification for security
- All passwords hashed with bcrypt (10 rounds)
- Session-based authentication with secure cookies

### 3. Story Interaction Features

- **Like stories** (heart icon)
- **Save/bookmark stories** to user profile
- **View liked stories** on profile page
- Stories show like counts
- Persistent user preferences across sessions

### 4. AI Story Generation

- **Custom story creation** using OpenAI API
- Users can specify:
  - Theme/topic
  - Age range
  - Language preference
- AI generates complete stories with:
  - Title
  - Summary
  - Moral lesson
  - Full story content

### 5. Story Content Requirements

Every story must include:
- Title
- Summary
- Moral lesson (REQUIRED for all stories)
- Full content (complete story text)
- Age range classification (0-2, 3-5, or 6-10 years)
- Language (en, fr, de, es)
- Author attribution
- Appropriate image
- Reading time estimate

---

## Classical Story Library Requirements

### Initial Library Size
- **51 total stories** in the application:
  - 6 sample stories
  - 45 classical bedtime stories from public domain sources

### Language Distribution
- **English**: 30 stories
- **French**: 7 stories
- **German**: 7 stories
- **Spanish**: 7 stories
- Stories balanced across all age ranges (0-2, 3-5, 6-10 years)

### Story Sources
- Brothers Grimm (German fairy tales)
- Charles Perrault (French fairy tales)
- Hans Christian Andersen (Danish fairy tales)
- Aesop's Fables (Ancient Greek)
- One Thousand and One Nights (Arabian tales)
- Traditional English, French, German, and Spanish tales

### Notable Stories Include

**English Stories (30 total):**
- Hansel and Gretel
- Cinderella
- Little Red Riding Hood
- The Three Little Pigs
- The Ugly Duckling
- Goldilocks and the Three Bears
- The Emperor's New Clothes
- Jack and the Beanstalk
- The Gingerbread Man
- Rapunzel
- The Little Mermaid
- Sleeping Beauty
- The Princess and the Pea
- Thumbelina
- The Elves and the Shoemaker
- The Bremen Town Musicians
- Beauty and the Beast
- The Tortoise and the Hare
- The Fisherman and His Wife
- The Little Match Girl
- The Town Mouse and the Country Mouse
- The Wolf and the Seven Young Kids
- The Golden Goose
- Puss in Boots
- Aladdin and the Magic Lamp
- Ali Baba and the Forty Thieves
- The Lion and the Mouse
- And more...

**French Stories (7 total):**
- Le Petit Chaperon Rouge (Little Red Riding Hood)
- Cendrillon (Cinderella)
- Le Chat Botté (Puss in Boots)
- La Belle au Bois Dormant (Sleeping Beauty)
- Le Vilain Petit Canard (The Ugly Duckling)
- Boucle d'Or et les Trois Ours (Goldilocks)

**German Stories (7 total):**
- Hänsel und Gretel
- Schneewittchen (Snow White)
- Der Froschkönig (The Frog Prince)
- Rumpelstilzchen (Rumpelstiltskin)
- Rotkäppchen (Little Red Riding Hood)
- Aschenputtel (Cinderella)

**Spanish Stories (7 total):**
- Los Tres Cerditos (The Three Little Pigs)
- Caperucita Roja (Little Red Riding Hood)
- Blancanieves (Snow White)
- La Cenicienta (Cinderella)
- El Patito Feo (The Ugly Duckling)
- Ricitos de Oro y los Tres Osos (Goldilocks)

---

## Technical Requirements

### Frontend Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter for lightweight client-side routing
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: 
  - TanStack React Query for server state and API caching
  - React Context API for authentication state
  - Local component state for UI interactions
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend Stack

- **Framework**: Express.js with TypeScript running on Node.js
- **API Architecture**: RESTful API with JSON request/response
- **Authentication**: Session-based using express-session
- **ORM**: Drizzle ORM for type-safe database queries
- **Database**: PostgreSQL (Neon Serverless)
- **Pattern**: Repository pattern separating business logic from data access

### Design System

- **Typography**: 
  - Inter font for UI elements
  - Merriweather font for story content (via Google Fonts)
- **Design Inspiration**: 
  - TikTok (feed mechanics)
  - Duolingo (friendly UI)
  - Instagram (like/save features)
- **Layout**:
  - Mobile-first responsive design
  - Bottom navigation for mobile
  - Full-screen story cards for immersive reading

### API Endpoints

- `/api/auth/signup` - User registration
- `/api/auth/login` - User login
- `/api/auth/logout` - User logout
- `/api/auth/me` - Get current user
- `/api/stories` - Story CRUD operations with filtering (GET, POST)
- `/api/stories/:id` - Individual story operations
- `/api/liked-stories` - Get user's saved stories
- `/api/liked-stories` - Like/unlike stories (POST, DELETE)
- `/api/users/preferences` - Update user preferences (PATCH)
- `/api/users/profile` - Update user profile (PATCH)
- `/api/stories/generate` - AI story generation endpoint (POST)

### Database Schema

**Users Table:**
- `id` (UUID, primary key)
- `username` (string, unique, required)
- `password` (string, hashed with bcrypt, required)
- `email` (string, optional)
- `preferredLanguage` (string: en/fr/de/es)
- `preferredAgeRange` (string: 0-2/3-5/6-10 years)

**Stories Table:**
- `id` (UUID, primary key)
- `title` (string, required)
- `summary` (string, required)
- `moral` (string, required)
- `fullContent` (text, required)
- `imageUrl` (string, required)
- `ageRange` (string, required)
- `language` (string, required)
- `isTranslated` (boolean)
- `originalLanguage` (string)
- `sourceType` (string: curated/user-shared)
- `authorId` (UUID, foreign key to users, nullable)
- `authorName` (string)
- `likeCount` (integer, default 0)
- `isPublic` (boolean, default true)

**LikedStories Table:**
- `userId` (UUID, foreign key to users)
- `storyId` (UUID, foreign key to stories)
- Composite primary key on (userId, storyId)
- Foreign keys with cascading deletes

### Database Design Decisions

- **Denormalized likeCount**: Stored directly in stories table for performance (avoids COUNT queries on feed)
- **Separate sourceType field**: Distinguishes curated vs user-generated content
- **isTranslated flag**: Supports multi-language content expansion and tracking
- **isPublic flag**: Enables future privacy features
- **UUID primary keys**: Better for distributed systems and security

---

## Production Requirements

### Auto-Initialization System

- **Database must auto-populate** with all 51 stories on first startup
- **No manual intervention required**: Production database seeds itself without running seed scripts
- **Idempotent startup**: System checks if stories table is empty before seeding
- **Prevents duplicates**: Only seeds once, skips on subsequent restarts
- **Implementation**: 
  - Stories stored in codebase (`server/classical-stories.ts`)
  - Auto-initialization runs on every app startup
  - Checks story count before inserting
  - Logs initialization status for monitoring

### Translation Metadata Rules

- `isTranslated` must be `true` when `language !== originalLanguage`
- `isTranslated` must be `false` when `language === originalLanguage`
- All translations properly tracked for future features

---

## Security Requirements

- **Password Security**:
  - bcrypt hashing with 10 rounds
  - Password changes require current password verification
  - No passwords stored in plain text
- **Session Security**:
  - Secure cookie configuration
  - HttpOnly cookies
  - Session-based authentication
- **API Security**:
  - Protected routes requiring authentication
  - Input validation using Zod schemas
  - No secrets exposed in frontend code
- **Environment Variables**:
  - DATABASE_URL for database connection
  - OPENAI_API_KEY for AI story generation
  - SESSION_SECRET for session encryption

---

## Data Integrity Requirements

- **No mock or placeholder data** in production paths
- **All stories must be complete and real**
- **Authentic images** from Unsplash or appropriate sources
- **Proper foreign key relationships** with cascading deletes
- **Validation at API layer** using Drizzle-Zod schemas
- **Type safety** across frontend and backend using TypeScript

---

## User Experience Requirements

### Interface
- Simple, everyday language in UI
- Mobile-optimized touch interactions
- Fast story browsing (vertical swipe)
- Clear visual hierarchy
- Intuitive navigation

### Content Discovery
- Age-appropriate content filtering
- Multi-language interface support
- Reading time estimates for planning
- Persistent user preferences
- Easy search functionality

### Performance
- Fast story loading
- Smooth animations
- Optimized images
- Cached API responses using React Query
- Minimal database queries (denormalized like counts)

---

## External Dependencies

### AI Service
- **OpenAI API** for story generation
- Used for creating custom bedtime stories
- Generates title, summary, moral lesson, and full content
- Based on user-specified theme, age range, and language

### Database
- **Neon Serverless PostgreSQL**
- WebSocket-based connection pooling for serverless environments
- Configured via DATABASE_URL environment variable

### Image Hosting
- **Unsplash** for curated story images
- Future: Support for AI-generated images or user uploads

### Session Storage
- **connect-pg-simple** for PostgreSQL-backed session storage
- Enables persistent sessions across server restarts

---

## Development Guidelines

### Code Quality
- TypeScript for type safety across entire stack
- ESLint for code quality
- Consistent code style
- Repository pattern for data access
- Thin API routes (business logic in storage layer)

### Testing Requirements
- Test authentication flows
- Test story creation and discovery
- Test AI generation endpoint
- Test user preferences and profile updates
- Test like/save functionality

### Deployment
- Replit deployment platform
- Auto-restart on code changes
- Environment variable management
- Production database separate from development

---

## Future Considerations

### Potential Enhancements
- AI-generated story images
- Audio narration of stories
- User-submitted stories (moderation required)
- Story collections/playlists
- Social sharing features
- Multiple child profiles per parent
- Bedtime routine scheduling
- Offline reading mode
- Story recommendations based on reading history

### Scalability
- Consider caching layer (Redis) for high traffic
- CDN for image delivery
- Database read replicas for scaling reads
- Background job processing for AI generation
- Rate limiting on AI generation endpoint

---

## Success Metrics

- User engagement (stories read per session)
- Story likes and saves
- Custom story generation usage
- User retention rates
- Multi-language adoption rates
- Age range distribution of usage

---

**Document Version**: 1.0  
**Last Updated**: November 2025  
**Status**: Production Ready
