import { db } from './db';
import { stories } from '../shared/schema';
import { writeFileSync } from 'fs';

/**
 * Exports all stories from development database to a TypeScript file
 * that can be imported by the initialization script
 */
async function exportStoriesToTypeScript() {
  try {
    const allStories = await db.select().from(stories);
    console.log(`📖 Found ${allStories.length} stories in development database`);

    // Remove auto-generated fields (id, createdAt) from stories
    const storiesForExport = allStories.map(({ id, createdAt, ...story }) => story);

    // Generate TypeScript code
    let tsContent = `/**
 * Auto-generated file containing all stories from development database
 * Generated on: ${new Date().toISOString()}
 * Total stories: ${allStories.length}
 * 
 * Note: id and createdAt fields are omitted and will be auto-generated when inserted
 */

export const developmentStories = ${JSON.stringify(storiesForExport, null, 2)};
`;

    // Write to file
    writeFileSync('server/development-stories.ts', tsContent);
    console.log(`✅ Successfully exported ${allStories.length} stories to server/development-stories.ts`);
    
    // Show breakdown by language
    const byLanguage = allStories.reduce((acc, story) => {
      acc[story.language] = (acc[story.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📊 Story breakdown by language:');
    Object.entries(byLanguage).forEach(([lang, count]) => {
      console.log(`   ${lang}: ${count} stories`);
    });

    // Show breakdown by source type
    const bySource = allStories.reduce((acc, story) => {
      acc[story.sourceType] = (acc[story.sourceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📚 Story breakdown by source:');
    Object.entries(bySource).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} stories`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting stories:', error);
    process.exit(1);
  }
}

exportStoriesToTypeScript();
