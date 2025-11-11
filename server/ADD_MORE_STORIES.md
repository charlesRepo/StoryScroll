# Adding More Classical Stories to StoryScroll

This guide explains how to add more classical stories to any of the three language libraries (English, French, or German).

## Quick Method: Add to Metadata and Regenerate

### Step 1: Add Story Metadata

Edit `server/classicalStoryData.ts` and add your story to the appropriate array:

**For English stories:**
```typescript
export const englishClassics: ClassicalStoryMeta[] = [
  // ... existing stories ...
  { 
    title: "Your Story Title", 
    author: "Author Name", 
    language: "en", 
    source: "Project Gutenberg", 
    description: "Brief description of the story's plot" 
  },
];
```

**For French stories:**
```typescript
export const frenchClassics: ClassicalStoryMeta[] = [
  // ... existing stories ...
  { 
    title: "Titre de votre histoire", 
    author: "Nom de l'auteur", 
    language: "fr", 
    source: "Wikisource", 
    description: "Brève description de l'intrigue" 
  },
];
```

**For German stories:**
```typescript
export const germanClassics: ClassicalStoryMeta[] = [
  // ... existing stories ...
  { 
    title: "Titel Ihrer Geschichte", 
    author: "Name des Autors", 
    language: "de", 
    source: "Wikisource", 
    description: "Kurze Beschreibung der Handlung" 
  },
];
```

### Step 2: Regenerate Library

```bash
# This will process all stories including your new ones
tsx server/seed-stories-batch.ts
```

This command will:
- Process your new story through AI
- Create a bedtime-appropriate adaptation
- Categorize it by age (2-4, 5-6, or 7-8 years)
- Generate an appropriate moral
- Add it to `story-library.json`
- Insert it into the database

### Step 3: Seed Production

```bash
# Use this to populate production database
tsx server/seed-production.ts
```

## Manual Method: Add Directly to JSON

If you want to add a story without AI processing (e.g., you've already adapted it):

### Step 1: Edit story-library.json

Add your story object to the array in `server/story-library.json`:

```json
{
  "title": "Your Story Title",
  "summary": "A 50-70 word summary suitable for bedtime",
  "moral": "Age-appropriate moral or lesson",
  "fullContent": "The complete bedtime story (300-600 words)",
  "imageUrl": "https://images.unsplash.com/photo-xxx?w=800&h=600&fit=crop",
  "ageRange": "5-6 years",
  "language": "en",
  "authorName": "adapted from Original Author",
  "sourceType": "classical"
}
```

**Important fields:**
- `ageRange`: Must be exactly "2-4 years", "5-6 years", or "7-8 years"
- `language`: Must be exactly "en", "fr", or "de"
- `sourceType`: Use "classical" for adapted classics, "ai-generated" for originals
- `authorName`: For classics, use "adapted from [Original Author]"

### Step 2: Seed Database

```bash
tsx server/seed-production.ts
```

## Age Range Guidelines

When choosing age ranges for your stories:

**2-4 years:**
- Pure fantasy and sensory experiences
- Very simple language and short sentences
- No complex morals or lessons
- Focus on colors, sounds, textures
- Examples: sensory adventures, simple animal stories

**5-6 years:**
- Fantasy with gentle life lessons
- Moderate vocabulary and sentence complexity
- Simple cause and effect
- Gentle morals about friendship, kindness
- Examples: fairy tales, magical adventures

**7-8 years:**
- Reality-based stories with clear lessons
- Complex themes and character development
- Stronger morals about responsibility, consequences
- Longer narratives with multiple plot points
- Examples: adventure stories with moral lessons

## Tips for Good Bedtime Stories

1. **Soothing Language**: Use calm, gentle vocabulary
2. **Peaceful Endings**: Always end on a positive, restful note
3. **Appropriate Length**: 300-600 words for the full story
4. **Clear Structure**: Beginning, middle, end
5. **Cultural Authenticity**: Respect the original story's cultural context

## Testing Your Additions

After adding stories, test them in the app:

1. Start the application: `npm run dev`
2. Navigate to the feed
3. Filter by the appropriate age range and language
4. Verify your story appears and displays correctly

## Troubleshooting

**Story not appearing in feed?**
- Check that `ageRange` matches exactly: "2-4 years", "5-6 years", or "7-8 years"
- Verify `language` is exactly "en", "fr", or "de"
- Ensure `isPublic` is set to `true` in the database

**AI processing failed?**
- Check your OpenAI API key is set
- Verify the story description is clear and detailed
- Try running the batch script again

**Database errors?**
- Make sure all required fields are present
- Check that field values match the expected types
- Verify the database connection is working
