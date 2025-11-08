# Bedtime Story Discovery App - Design Guidelines

## Design Approach

**Reference-Based Design** drawing inspiration from:
- **TikTok**: Vertical swipe feed mechanics and full-screen card engagement
- **Duolingo**: Friendly, approachable UI for parents with clear age-based categories
- **Instagram**: Like/save functionality and clean content cards
- **Storytel/Audible**: Story presentation and reading experience

**Core Principle**: Create a calming, trustworthy interface that parents can use during bedtime routines while maintaining engagement through smooth interactions.

## Typography System

**Font Families** (Google Fonts):
- Primary: "Inter" (400, 500, 600, 700) - UI elements, labels, metadata
- Reading: "Merriweather" (400, 700) - Story titles and full story content for optimal readability

**Hierarchy**:
- Story Card Titles: text-2xl to text-3xl, font-semibold (Merriweather)
- Story Summary: text-base, font-normal, leading-relaxed (Inter)
- Metadata (age, language, source): text-sm, font-medium (Inter)
- Full Story Body: text-lg, leading-loose (Merriweather)
- Navigation Labels: text-sm, font-semibold (Inter)
- Buttons/CTAs: text-base, font-semibold (Inter)

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, and 16
- Component padding: p-4 to p-6
- Vertical spacing: space-y-4 to space-y-6
- Card margins: m-4
- Section gaps: gap-8 to gap-12

**Mobile-First Grid**:
- Full-screen story cards: h-screen with safe area padding
- Profile grid for liked stories: grid-cols-2 with gap-4
- Filter chips: flex with gap-2 horizontal scroll

## Component Library

### Core Navigation
**Bottom Navigation Bar** (fixed):
- 4 icons: Feed (home), Create (plus), Liked (heart), Profile (user)
- Height: h-16 with safe-area-inset-bottom
- Icon size: w-6 h-6 with labels (text-xs)

**Top Filter Bar** (sticky):
- Age selector: Pill-style chips (0-2, 3-5, 6-10 years)
- Language dropdown: Compact selector with flag icons
- Height: h-14 with backdrop blur effect

### Story Feed Components

**Story Card** (full-screen, swipeable):
- Container: h-screen with vertical centering
- Illustration area: Upper 50% (aspect-ratio-4/3 or 1/1)
- Content area: Lower 50% with p-6
  - Story title (prominent)
  - Age badge (rounded-full, px-3, py-1)
  - Language badge with translation indicator if applicable
  - Summary text (3-4 lines, line-clamp-4)
  - Source attribution (text-xs with icon: book for public domain, user icon for shared)
  - Like button (bottom-right corner, floating)
- Tap anywhere to expand to full story

**Story Source Badges**:
- Public Domain: Small book icon + "Classic Story"
- User-Shared: User avatar thumbnail + username
- Translated: Globe icon + "Translated from [language]"

### Full Story View (Modal/Page)

**Layout**:
- Header: Title, close button (top-right X), metadata row
- Scrollable content area: max-w-prose, mx-auto, px-6, py-8
- Story text: Large, comfortable reading size
- Footer: Like button (if applicable), share functionality

### Story Creation Interface

**Multi-step Form**:
- Step 1: Text area for story description (h-32, rounded-lg, p-4)
- Step 2: Age selector (radio cards with illustrations)
- Step 3: Language dropdown
- Step 4: Privacy toggle (Public/Private with clear icons)
- Generate button: Large, prominent CTA at bottom
- Loading state: Animated placeholder while generating

### User Profile

**Structure**:
- Header: Avatar, name, child's age/language preferences
- Tabs: "Liked Stories" and "My Shared Stories"
- Story Grid: 2-column grid of thumbnail cards
  - Each card: Image, title, like count
  - Tap to open full story

### Authentication Screens

**Login Page**:
- App logo and tagline at top
- Two prominent buttons: "Sign in with Google" and "Sign in with Apple"
- Each button: w-full, h-12, with brand icons
- Spacing: space-y-4

## Interaction Patterns

**Gestures**:
- Swipe up/down: Navigate between story cards (smooth snap to next card)
- Tap card: Expand to full story view
- Pull to refresh: Reload feed at top
- Swipe right on card: Quick like (haptic feedback)

**Animations**: Minimal and purposeful
- Card transitions: Smooth slide with 300ms ease
- Like button: Gentle scale and heart fill animation
- Loading states: Subtle pulse for story generation
- Badge transitions: Soft fade-in when scrolling

**No hover states needed** - mobile-only touch interactions

## Accessibility

- Touch targets: Minimum 44x44px (h-11, w-11)
- Form inputs: Large text, clear labels, proper ARIA attributes
- Contrast: Ensure readable text on all backgrounds
- Focus states: Clear outlines for keyboard navigation (web accessibility)
- Screen reader labels: All icons and interactive elements properly labeled

## Images

**Required Images**:
- **Story Card Illustrations**: Each story needs a cover illustration (aspect-ratio-4/3 or square). Use placeholder images showing whimsical, child-friendly scenes - animals, nature, adventures. Sources: Unsplash (children's book illustrations, watercolor art)
- **User Avatars**: Default avatar placeholders for shared stories
- **Empty States**: Illustration for "No liked stories yet" with friendly character

**No hero image** - This is a mobile feed app, not a landing page. Visual focus is on individual story cards.

## Content Guidelines

**Story Cards - Information Hierarchy**:
1. Illustration (dominant visual)
2. Story title (most prominent text)
3. Age badge + Language badge (scannable)
4. Summary (preview text)
5. Source attribution (subtle footer)
6. Like button (floating, unobtrusive)

**Filter Priority**: Age > Language (most parents filter by age first)

**Trust Indicators**: Always show clear source attribution to build parent confidence in content safety.