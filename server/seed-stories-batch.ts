import { db } from "./db";
import { stories } from "../shared/schema";
import {
  englishClassics,
  frenchClassics,
  germanClassics,
} from "./classicalStoryData";
import {
  processClassicalStory,
  generateOriginalStory,
  type ProcessedStory,
} from "./story-processor";
import { writeFileSync } from "fs";
import { join } from "path";

// Placeholder image URLs (using Unsplash)
const getImageUrl = (index: number) => {
  const imageIds = [
    "photo-1516979187457-637abb4f9353", // bedtime
    "photo-1604004555489-723a93d6ce74", // fairytale
    "photo-1476234251651-f353c1b3e3a1", // magical
    "photo-1516571748831-5d81767b788d", // dreamy
    "photo-1518709594023-6eab9bab7b23", // night sky
  ];
  const id = imageIds[index % imageIds.length];
  return `https://images.unsplash.com/${id}?w=800&h=600&fit=crop`;
};

async function processWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries} after error:`, error);
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

async function main() {
  console.log("\n🌙 StoryScroll - Classical Story Library Builder 🌙\n");
  console.log("Building comprehensive tri-lingual bedtime story library...\n");

  const allProcessedStories: ProcessedStory[] = [];
  let imageIndex = 0;

  // Process English Classics (30 stories)
  console.log("📚 Processing English Classics (30 stories)...");
  for (let i = 0; i < englishClassics.length; i++) {
    const meta = englishClassics[i];
    try {
      const processed = await processWithRetry(() =>
        processClassicalStory(meta)
      );
      allProcessedStories.push(processed);
      console.log(
        `  ✅ ${i + 1}/30: ${processed.title} (${processed.ageRange})`
      );
    } catch (error) {
      console.error(`  ❌ Failed to process ${meta.title}:`, error);
    }

    // Rate limiting
    if (i < englishClassics.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Process French Classics (30 stories)
  console.log("\n📚 Processing French Classics (30 stories)...");
  for (let i = 0; i < frenchClassics.length; i++) {
    const meta = frenchClassics[i];
    try {
      const processed = await processWithRetry(() =>
        processClassicalStory(meta)
      );
      allProcessedStories.push(processed);
      console.log(
        `  ✅ ${i + 1}/30: ${processed.title} (${processed.ageRange})`
      );
    } catch (error) {
      console.error(`  ❌ Failed to process ${meta.title}:`, error);
    }

    if (i < frenchClassics.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Process German Classics (30 stories)
  console.log("\n📚 Processing German Classics (30 stories)...");
  for (let i = 0; i < germanClassics.length; i++) {
    const meta = germanClassics[i];
    try {
      const processed = await processWithRetry(() =>
        processClassicalStory(meta)
      );
      allProcessedStories.push(processed);
      console.log(
        `  ✅ ${i + 1}/30: ${processed.title} (${processed.ageRange})`
      );
    } catch (error) {
      console.error(`  ❌ Failed to process ${meta.title}:`, error);
    }

    if (i < germanClassics.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Generate AI-original stories (10 per language = 30 total)
  console.log("\n✨ Generating AI-Original Stories (30 stories)...");

  // English originals
  console.log("  English originals (10)...");
  for (let i = 0; i < 10; i++) {
    try {
      const processed = await processWithRetry(() =>
        generateOriginalStory("en", i)
      );
      allProcessedStories.push(processed);
      console.log(
        `  ✅ EN ${i + 1}/10: ${processed.title} (${processed.ageRange})`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ❌ Failed to generate English story ${i + 1}:`, error);
    }
  }

  // French originals
  console.log("  French originals (10)...");
  for (let i = 0; i < 10; i++) {
    try {
      const processed = await processWithRetry(() =>
        generateOriginalStory("fr", i)
      );
      allProcessedStories.push(processed);
      console.log(
        `  ✅ FR ${i + 1}/10: ${processed.title} (${processed.ageRange})`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ❌ Failed to generate French story ${i + 1}:`, error);
    }
  }

  // German originals
  console.log("  German originals (10)...");
  for (let i = 0; i < 10; i++) {
    try {
      const processed = await processWithRetry(() =>
        generateOriginalStory("de", i)
      );
      allProcessedStories.push(processed);
      console.log(
        `  ✅ DE ${i + 1}/10: ${processed.title} (${processed.ageRange})`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ❌ Failed to generate German story ${i + 1}:`, error);
    }
  }

  // Export to JSON for production seeding
  console.log("\n💾 Exporting stories to JSON...");
  const exportData = allProcessedStories.map((story, index) => ({
    ...story,
    imageUrl: getImageUrl(imageIndex++),
  }));

  const exportPath = join(process.cwd(), "server", "story-library.json");
  writeFileSync(exportPath, JSON.stringify(exportData, null, 2), "utf-8");
  console.log(`  ✅ Exported ${exportData.length} stories to story-library.json`);

  // Insert into database
  console.log("\n💿 Inserting stories into database...");
  for (const story of exportData) {
    await db.insert(stories).values({
      title: story.title,
      summary: story.summary,
      moral: story.moral,
      fullContent: story.fullContent,
      imageUrl: story.imageUrl,
      ageRange: story.ageRange,
      language: story.language,
      isTranslated: false,
      originalLanguage: story.language,
      sourceType: story.sourceType,
      authorName: story.authorName,
      isPublic: true,
    });
  }

  console.log(`  ✅ Inserted ${exportData.length} stories into database`);

  // Summary statistics
  const stats = {
    total: allProcessedStories.length,
    byLanguage: {
      en: allProcessedStories.filter((s) => s.language === "en").length,
      fr: allProcessedStories.filter((s) => s.language === "fr").length,
      de: allProcessedStories.filter((s) => s.language === "de").length,
    },
    byAge: {
      "2-4": allProcessedStories.filter((s) => s.ageRange === "2-4 years")
        .length,
      "5-6": allProcessedStories.filter((s) => s.ageRange === "5-6 years")
        .length,
      "7-8": allProcessedStories.filter((s) => s.ageRange === "7-8 years")
        .length,
    },
    byType: {
      classical: allProcessedStories.filter((s) => s.sourceType === "classical")
        .length,
      ai: allProcessedStories.filter((s) => s.sourceType === "ai-generated")
        .length,
    },
  };

  console.log("\n📊 Library Statistics:");
  console.log(`  Total Stories: ${stats.total}`);
  console.log(`  Languages: EN=${stats.byLanguage.en}, FR=${stats.byLanguage.fr}, DE=${stats.byLanguage.de}`);
  console.log(`  Age Ranges: 2-4=${stats.byAge["2-4"]}, 5-6=${stats.byAge["5-6"]}, 7-8=${stats.byAge["7-8"]}`);
  console.log(`  Types: Classical=${stats.byType.classical}, AI-Original=${stats.byType.ai}`);

  console.log("\n✨ Story library build complete! ✨\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
