# Bedtime Story Discovery App

## Overview
A mobile-first web application designed for discovering and creating bedtime stories for children. The app features a TikTok-style vertical swipe feed for browsing, AI-powered story generation, and personalized filtering. Supports **English and French** languages. Its purpose is to provide an engaging platform where parents can find, save, and create custom stories tailored to their children's age, language, and preferences, leveraging a rich library of both classical and AI-generated content.

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
- **Initialization**: Automatic database population on startup with a curated library of 135 AI-generated classical bedtime stories (113 English, 20 French), ensuring a rich content base for new deployments.

## External Dependencies

- **AI Service**: OpenAI API for generating custom bedtime stories (title, summary, moral, full content). Summaries limited to 70 words or 390 characters for optimal mobile readability.
- **Database**: Neon Serverless PostgreSQL, configured via `DATABASE_URL`.
- **UI Components**: Radix UI primitives, shadcn/ui, Lucide React (icons).
- **Session Storage**: `connect-pg-simple` for PostgreSQL-backed session persistence.
- **Image Hosting**: Unsplash (placeholders), with future plans for AI-generated or user-uploaded images.

## Recent Changes

### StoryScroll Logo & Color Scheme Integration (November 2025)
Integrated official branding with new logo and comprehensive color palette update:
- **Logo Asset**: Added `attached_assets/storyscroll_logo_1762725801637.png` featuring sleeping scroll character with moon and stars
- **Logo Placement**: 
  - AuthScreen: Large logo (128x128px) above "StoryScroll" title on authentication screen
  - App Header: Branded header bar at top of feed with dark blue background `rgb(19, 50, 81)`, vertical padding for breathing room, logo (60x60px) on left, and "StoryScroll" text in golden yellow `hsl(43, 85%, 65%)` next to it
- **Brand Name**: Changed from "Bedtime Stories" to "StoryScroll" across the application
- **Color Palette** (extracted from logo):
  - **Primary**: Golden Yellow `hsl(43, 85%, 55-60%)` - Warmth, magic, storytelling
  - **Background**: Deep Teal `hsl(195, 52%, 12-24%)` for dark mode, Warm Cream `hsl(43, 65%, 96%)` for light mode
  - **Foreground**: Deep Teal text `hsl(195, 52%, 18%)` in light mode, Golden Cream `hsl(43, 85%, 90%)` in dark mode
- **Design Philosophy**: Bedtime theme with nighttime sky (teal) and warm story elements (golden yellow). Header uses logo's dark teal background for strong brand identity.
- **Updated Files**: `client/src/index.css`, `client/src/components/AuthScreen.tsx`, `client/src/components/FilterBar.tsx`, `design_guidelines.md`
- **Testing**: Verified logo display in both locations, branded header appearance with correct colors, sticky behavior, color scheme application across all components, and readability in both light/dark modes

### Story Publishing & Editing Feature (November 2025)
Added comprehensive story publishing and management capabilities:
- **Edit Before Publishing**: After AI generates a story, users can now edit title, summary, moral, and full content before publishing
- **Privacy Control**: Users can choose to share stories publicly or keep them private via isPublic toggle
- **My Stories Section**: Profile now displays all user's published stories with view/delete options
- **Story Ownership**: Backend enforces ownership checks on PATCH/DELETE operations to prevent unauthorized edits
- **Enhanced Search**: Search includes user's own stories (both public and private) plus other users' public stories
- **Feed Integration**: Public user-shared stories automatically appear in the main feed alongside classical stories
- **Backend Endpoints**: Added GET /api/stories/mine, PATCH /api/stories/:id, DELETE /api/stories/:id
- **Storage Methods**: Implemented getUserStories, updateStory, deleteStory for complete CRUD operations
- **Components**: Created EditStoryForm and MyStoriesSection components for seamless user experience

### AI-Based Story Expansion & Categorization (November 2025)
Implemented comprehensive AI-powered system for story library management:

**Story Library Expansion**:
- **English Library**: 117 original stories (Grimm, Andersen, Aesop's Fables, traditional folktales)
- **French Library**: 50 original stories (Perrault, La Fontaine fables, d'Aulnoy fairy tales)
- Added 30 new classical French stories using AI generation from curated titles list

**AI-Based Categorization System**:
- **Categorization Criteria**:
  - 0-2 years: Pure fantasy themes with no moral lessons (simple sensory stories)
  - 3-5 years: Fantasy mixed with simple moral lessons
  - 6-10 years: Realistic themes with strong moral lessons
- **Final Distribution** (199 total stories):
  - English: 6 (0-2 years), 116 (3-5 years), 11 (6-10 years) = 133 stories
  - French: 14 (0-2 years), 44 (3-5 years), 6 (6-10 years) = 64 stories
- **Note**: Classical stories (Perrault, Grimm, La Fontaine) naturally fall into 3-5 and 6-10 years due to their moral-teaching nature. The 0-2 years category requires specially curated simple, moral-free stories.

**Translation System**:
- Bidirectional AI translation capability (French ↔ English)
- Smart deduplication prevents duplicate translations
- Tracks isTranslated and originalLanguage fields for all stories

**Standardized Story Addition**:
- API endpoint `/api/stories/add-with-translation` for adding new stories
- Automatically generates summary and extracts moral using AI
- Auto-categorizes by age group based on content analysis
- Optionally translates to the other language (FR ↔ EN)
- All new stories properly tagged with author, source type, and language metadata
- **Frontend Updates**: Language selectors updated across FilterBar, ProfileSection, and CreateStoryForm

### Story Summary & Title Optimization (November 2025)
Optimized story presentation for better mobile readability:
- **Title Font-Size**: Reduced from 36px to 32px for better visual balance
- **Summary Length**: Capped at 70 words or 390 characters (displays 4-5 lines on mobile)
- **AI Generation**: Updated OpenAI prompt to enforce summary length limits for all new stories
- **Result**: Clean, readable cards that provide quick story context without overwhelming the screen

### Filter Loading State (November 2025)
Improved user feedback during filter changes:
- **Loading Spinner**: Overlay spinner appears when changing age range or language filters
- **Minimum Display Time**: Enforced 500ms minimum display to prevent flashing (even for fast API responses)
- **Implementation**: Uses TanStack Query's `isFetching` state with custom timing logic to ensure visibility
- **Visual Design**: Semi-transparent dark overlay with large spinner icon and "Loading stories..." text in centered card
- **Query Configuration**: `staleTime: 0, gcTime: 0` to ensure every filter change triggers a fresh API call
- **UX Improvement**: Consistent loading feedback prevents jarring instant updates and shows users the app is responding to their input

### End-of-Feed Message (November 2025)
Added clear indication when user reaches the end of available stories:
- **Message**: "No more stories to show" appears after the last story card
- **Helper Text**: Suggests changing filters to see different stories
- **Snap Scroll**: Message uses same full-height layout and snap behavior as story cards
- **Conditional Display**: Only shows when stories are available (not shown in empty state)

### Author Attribution Display (November 2025)
Improved story source attribution for clarity:
- **Unified Label**: Changed from "Classic Story" / "Shared by" to consistent "Author:" label
- **Source Display**: Shows actual author/source names (e.g., "Author: Brothers Grimm", "Author: Hans Christian Andersen")
- **Consistency**: Same display format in both story cards and story modal
- **Classical Sources**: All 135 classical stories properly attributed to original authors (Grimm, Andersen, Aesop, Perrault, etc.)

### Image Removal & Search Fix (November 2025)
Removed broken placeholder images to fix functionality issues:
- **Story Modal**: Removed broken Unsplash image placeholder from modal view
- **Search Results**: Removed broken images from search result cards
- **Click Fix**: Fixed search card clickability by removing `overflow-hidden` class that conflicted with elevation utilities
- **Current State**: App displays text-only story cards and modals
- **Trade-off**: Improved functionality (no broken images, everything clickable) at cost of visual appeal
- **Note**: Database still contains `imageUrl` field with Unsplash placeholders; not currently displayed in UI
- **Future Options**: Could add proper image generation, upload custom illustrations, or use reliable image service

### Age-Specific Story Generation Pipeline (November 2025)
Built specialized AI generation system to fill gaps in underrepresented age groups:

**Infrastructure Created**:
- **Curated Theme Banks** (`server/storyTitleBanks.ts`): 15 infant + 15 older themes for both EN/FR
  - Infant themes: Sensory stories (The Sleepy Moon, Soft Cloud's Journey, etc.)
  - Older themes: Realistic scenarios (The Lost Library Book, Broken Promise, etc.)
- **Generation Pipeline** (`server/generateAgeSpecificStories.ts`):
  - Age-specific prompts with strict content requirements
  - Retry logic (3 attempts per story) to ensure quality
  - Batch processing to avoid timeouts
- **Validation System**:
  - Word count enforcement: 120-220 words (0-2 years), 450-650 words (6-10 years)
  - Pattern-based moral detection using regex to identify teaching phrases
  - Rejects infant stories with moral lessons, ensures older stories have morals

**Results**:
- Generated 20 infant stories (6 EN, 14 FR) with pure sensory content
- Generated 17 older stories (11 EN, 6 FR) with realistic themes and morals
- Filled previously empty age cohorts, providing balanced content distribution
- 100% validation success rate on final test batches

**Technical Notes**:
- French stories trend shorter due to language conciseness
- Validation improved from keyword matching to pattern-based phrase detection
- All new stories tagged with `authorName: "StoryScroll Team"` and `sourceType: "curated"`

### Error Message Improvements (November 2025)
Implemented centralized error handling to prevent JSON objects from appearing in user-facing error messages:
- **Frontend Utility**: Created `normalizeErrorMessage()` in `client/src/lib/errorUtils.ts` to extract readable text from any error format
- **Query Client**: Updated `throwIfResNotOk` to normalize all API errors before displaying them
- **Backend Consistency**: Fixed Zod validation errors to return formatted strings instead of arrays
- **Result**: All error toasts now display clean, user-friendly English text instead of raw JSON objects or "[object Object]"
- **Coverage**: Affects all error displays across AuthScreen, SettingsDialog, CreateStoryForm, HomePage, and ChangePasswordDialog
- **Error Contract**: Backend consistently returns `{ error: "string message" }` format for all error responses