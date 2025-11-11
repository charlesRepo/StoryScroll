import { db } from "./db";
import { stories } from "@shared/schema";
import { batchCategorizeStories } from "./aiStoryHelpers";

async function main() {
  try {
    console.log("🔄 Starting story recategorization...\n");
    console.log("This will recategorize all existing stories to new age ranges:");
    console.log("- Old: 0-2 years, 3-5 years, 6-10 years");
    console.log("- New: 2-4 years, 5-6 years, 7-8 years\n");

    // Fetch all stories
    const allStories = await db.select().from(stories);
    console.log(`📚 Found ${allStories.length} stories to recategorize\n`);

    if (allStories.length === 0) {
      console.log("✅ No stories to recategorize");
      return;
    }

    // Prepare stories for categorization
    const storiesToCategorize = allStories.map(story => ({
      id: story.id,
      title: story.title,
      summary: story.summary,
      moral: story.moral,
      fullContent: story.fullContent,
    }));

    // Batch categorize using AI
    console.log("🤖 Analyzing stories with AI...");
    const categorizations = await batchCategorizeStories(storiesToCategorize);
    console.log(`✅ Analyzed ${categorizations.size} stories\n`);

    // Update each story in the database
    let updated = 0;
    for (const [storyId, analysis] of categorizations.entries()) {
      const oldStory = allStories.find(s => s.id === storyId);
      if (!oldStory) continue;

      await db
        .update(stories)
        .set({ ageRange: analysis.ageRange })
        .where(eq(stories.id, storyId));

      updated++;
      console.log(
        `✅ [${updated}/${categorizations.size}] ${oldStory.title}: ${oldStory.ageRange} → ${analysis.ageRange}`
      );
      console.log(`   Reason: ${analysis.reasoning}\n`);
    }

    // Show final distribution
    const updatedStories = await db.select().from(stories);
    const distribution = updatedStories.reduce((acc, s) => {
      const key = `${s.language}-${s.ageRange}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 Recategorization Complete!");
    console.log(`\n📊 New Distribution:`);
    console.log(JSON.stringify(distribution, null, 2));
  } catch (error) {
    console.error("❌ Recategorization failed:", error);
    process.exit(1);
  }
}

// Import eq from drizzle-orm
import { eq } from "drizzle-orm";

// Run if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main();
}

export { main as recategorizeStories };
