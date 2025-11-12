import { db } from './db';
import { stories } from '../shared/schema';

async function exportStories() {
  try {
    const allStories = await db.select().from(stories);
    console.log(`-- Found ${allStories.length} stories in development database`);
    console.log(`-- Copy these INSERT statements to your Production Database\n`);

    for (const story of allStories) {
      const values = [
        story.id,
        story.title,
        story.summary,
        story.moral,
        story.fullContent,
        story.imageUrl,
        story.language,
        story.isTranslated,
        story.originalLanguage,
        story.authorName,
        story.authorId,
        story.isPublic,
        story.likeCount
      ];

      const escapedValues = values.map(v => {
        if (v === null || v === undefined) return 'NULL';
        if (typeof v === 'boolean') return v ? 'true' : 'false';
        if (typeof v === 'number') return v.toString();
        // Escape single quotes in strings by doubling them
        return "'" + v.toString().replace(/'/g, "''") + "'";
      });

      console.log(
        `INSERT INTO stories (id, title, summary, moral, full_content, image_url, language, is_translated, original_language, author_name, author_id, is_public, like_count) VALUES (${escapedValues.join(', ')});`
      );
    }

    console.log(`\n-- Total: ${allStories.length} INSERT statements generated`);
    process.exit(0);
  } catch (error) {
    console.error('Error exporting stories:', error);
    process.exit(1);
  }
}

exportStories();
