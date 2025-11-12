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
        story.sourceType,
        story.authorName,
        story.authorId,
        story.isPublic,
        story.likeCount
      ];

      const escapedValues = values.map(v => {
        if (v === null || v === undefined) return 'NULL';
        if (typeof v === 'boolean') return v ? 'true' : 'false';
        if (typeof v === 'number') return v.toString();
        // Escape special characters for SQL:
        // 1. Backslashes first (to avoid double-escaping)
        // 2. Single quotes (double them)
        // 3. Newlines (replace with space to keep on one line)
        // 4. Carriage returns and tabs
        const escaped = v.toString()
          .replace(/\\/g, '\\\\')       // Escape backslashes
          .replace(/'/g, "''")           // Escape single quotes
          .replace(/\n/g, ' ')           // Replace newlines with spaces
          .replace(/\r/g, ' ')           // Replace carriage returns
          .replace(/\t/g, ' ');          // Replace tabs with spaces
        return "'" + escaped + "'";
      });

      console.log(
        `INSERT INTO stories (id, title, summary, moral, full_content, image_url, language, is_translated, original_language, source_type, author_name, author_id, is_public, like_count) VALUES (${escapedValues.join(', ')});`
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
