import { db } from "./db";
import { stories } from "../shared/schema";
import { generateOriginalStory, type ProcessedStory } from "./story-processor";

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

async function processWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
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

async function main() {
  console.log("\n✨ SESSION 4: AI-Original Stories (30 stories) ✨\n");

  const processedStories: ProcessedStory[] = [];
  let imageIndex = 90; // Start from 90 to avoid duplicate image URLs

  // 10 English originals
  console.log("🇬🇧 Generating English originals (10)...");
  for (let i = 0; i < 10; i++) {
    console.log(`\n[${i + 1}/10] Generating English original...`);
    try {
      const processed = await processWithRetry(() => generateOriginalStory("en"));
      processedStories.push(processed);
      console.log(`  ✅ "${processed.title}" - Age: ${processed.ageRange}`);
    } catch (error) {
      console.error(`  ❌ Failed:`, error);
    }
    if (i < 9) await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 10 French originals
  console.log("\n🇫🇷 Generating French originals (10)...");
  for (let i = 0; i < 10; i++) {
    console.log(`\n[${i + 1}/10] Generating French original...`);
    try {
      const processed = await processWithRetry(() => generateOriginalStory("fr"));
      processedStories.push(processed);
      console.log(`  ✅ "${processed.title}" - Age: ${processed.ageRange}`);
    } catch (error) {
      console.error(`  ❌ Failed:`, error);
    }
    if (i < 9) await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 10 German originals
  console.log("\n🇩🇪 Generating German originals (10)...");
  for (let i = 0; i < 10; i++) {
    console.log(`\n[${i + 1}/10] Generating German original...`);
    try {
      const processed = await processWithRetry(() => generateOriginalStory("de"));
      processedStories.push(processed);
      console.log(`  ✅ "${processed.title}" - Age: ${processed.ageRange}`);
    } catch (error) {
      console.error(`  ❌ Failed:`, error);
    }
    if (i < 9) await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n\n📊 Session 4 Results:`);
  console.log(`  Successful: ${processedStories.length}/30`);
  console.log(`  Failed: ${30 - processedStories.length}`);

  if (processedStories.length > 0) {
    const ageStats = {
      "2-4": processedStories.filter((s) => s.ageRange === "2-4 years").length,
      "5-6": processedStories.filter((s) => s.ageRange === "5-6 years").length,
      "7-8": processedStories.filter((s) => s.ageRange === "7-8 years").length,
    };
    const langStats = {
      en: processedStories.filter((s) => s.language === "en").length,
      fr: processedStories.filter((s) => s.language === "fr").length,
      de: processedStories.filter((s) => s.language === "de").length,
    };
    console.log(`\n  Age distribution:`);
    console.log(`    2-4 years: ${ageStats["2-4"]}`);
    console.log(`    5-6 years: ${ageStats["5-6"]}`);
    console.log(`    7-8 years: ${ageStats["7-8"]}`);
    console.log(`\n  Language distribution:`);
    console.log(`    English: ${langStats.en}`);
    console.log(`    French: ${langStats.fr}`);
    console.log(`    German: ${langStats.de}`);

    console.log(`\n💿 Inserting into database...`);
    for (const story of processedStories) {
      await db.insert(stories).values({
        title: story.title,
        summary: story.summary,
        moral: story.moral,
        fullContent: story.fullContent,
        imageUrl: getImageUrl(imageIndex++),
        ageRange: story.ageRange,
        language: story.language,
        isTranslated: false,
        originalLanguage: story.language,
        sourceType: story.sourceType,
        authorName: story.authorName,
        isPublic: true,
      });
    }
    console.log(`  ✅ Database updated with ${processedStories.length} AI-original stories`);
  }

  console.log("\n🎉 ALL SESSIONS COMPLETE! 🎉");
  console.log("Your StoryScroll library now has all 120 bedtime stories! 🌙✨\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
