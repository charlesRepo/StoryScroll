import { db } from "./db";
import { stories } from "../shared/schema";
import { englishClassics } from "./classicalStoryData";
import {
  processClassicalStory,
  type ProcessedStory,
} from "./story-processor";

// Pilot test: Generate 5 English stories to validate the system
async function processWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`  Retry ${i + 1}/${maxRetries} after error`);
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

async function pilotTest() {
  console.log("\n🧪 StoryScroll - Pilot Test (5 English Stories) 🧪\n");

  const testStories = englishClassics.slice(0, 5);
  const processedStories: ProcessedStory[] = [];

  for (let i = 0; i < testStories.length; i++) {
    const meta = testStories[i];
    console.log(`\nProcessing ${i + 1}/5: ${meta.title}`);

    try {
      const processed = await processWithRetry(() =>
        processClassicalStory(meta)
      );
      processedStories.push(processed);
      console.log(`  ✅ Success!`);
      console.log(`     Age: ${processed.ageRange}`);
      console.log(`     Summary length: ${processed.summary.length} chars`);
      console.log(`     Content length: ${processed.fullContent.length} chars`);
      console.log(`     Moral: ${processed.moral.substring(0, 50)}...`);
    } catch (error) {
      console.error(`  ❌ Failed:`, error);
    }

    // Rate limiting
    if (i < testStories.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  console.log(`\n\n📊 Pilot Test Results:`);
  console.log(`  Attempted: ${testStories.length}`);
  console.log(`  Successful: ${processedStories.length}`);
  console.log(`  Failed: ${testStories.length - processedStories.length}`);

  if (processedStories.length > 0) {
    console.log(`\n  Age distribution:`);
    const ageStats = {
      "2-4": processedStories.filter((s) => s.ageRange === "2-4 years").length,
      "5-6": processedStories.filter((s) => s.ageRange === "5-6 years").length,
      "7-8": processedStories.filter((s) => s.ageRange === "7-8 years").length,
    };
    console.log(`    2-4 years: ${ageStats["2-4"]}`);
    console.log(`    5-6 years: ${ageStats["5-6"]}`);
    console.log(`    7-8 years: ${ageStats["7-8"]}`);

    console.log(`\n💿 Inserting into database...`);
    for (const story of processedStories) {
      await db.insert(stories).values({
        title: story.title,
        summary: story.summary,
        moral: story.moral,
        fullContent: story.fullContent,
        imageUrl: `https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=600&fit=crop`,
        ageRange: story.ageRange,
        language: story.language,
        isTranslated: false,
        originalLanguage: story.language,
        sourceType: story.sourceType,
        authorName: story.authorName,
        isPublic: true,
      });
    }
    console.log(`  ✅ Database updated with ${processedStories.length} stories`);
  }

  console.log("\n✨ Pilot test complete! ✨\n");
}

pilotTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
