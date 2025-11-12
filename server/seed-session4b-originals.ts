import { db } from "./db";
import { stories } from "../shared/schema";
import { generateOriginalStory } from "./story-processor";

const getImageUrl = (index: number) => {
  const imageIds = [
    "photo-1516979187457-637abb4f9353",
    "photo-1604004555489-723a93d6ce74",
    "photo-1476234251651-f353c1b3e3a1",
    "photo-1516571748831-5d81767b788d",
    "photo-1518709594023-6eab9bab7b23",
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
      console.log(`  Retry ${i + 1}/${maxRetries}`);
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

async function main() {
  console.log("\n✨ SESSION 4B: AI-Original Stories Part 2 (15 stories) ✨\n");

  let successCount = 0;

  // 5 English + 5 French + 5 German = 15 stories
  console.log("🇬🇧 English originals (5 more)...");
  for (let i = 5; i < 10; i++) {
    console.log(`\n[${i + 1}/10] Generating English original...`);
    try {
      const processed = await processWithRetry(() => generateOriginalStory("en", i));
      
      await db.insert(stories).values({
        title: processed.title,
        summary: processed.summary,
        moral: processed.moral,
        fullContent: processed.fullContent,
        imageUrl: getImageUrl(105 + successCount),
        ageRange: processed.ageRange,
        language: processed.language,
        isTranslated: false,
        originalLanguage: processed.language,
        sourceType: processed.sourceType,
        authorName: processed.authorName,
        isPublic: true,
      });
      
      successCount++;
      console.log(`  ✅ "${processed.title}" (${processed.ageRange}) - Saved`);
    } catch (error) {
      console.error(`  ❌ Failed:`, error);
    }
    if (i < 9) await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n🇫🇷 French originals (5 more)...");
  for (let i = 5; i < 10; i++) {
    console.log(`\n[${i + 1}/10] Generating French original...`);
    try {
      const processed = await processWithRetry(() => generateOriginalStory("fr", i));
      
      await db.insert(stories).values({
        title: processed.title,
        summary: processed.summary,
        moral: processed.moral,
        fullContent: processed.fullContent,
        imageUrl: getImageUrl(105 + successCount),
        ageRange: processed.ageRange,
        language: processed.language,
        isTranslated: false,
        originalLanguage: processed.language,
        sourceType: processed.sourceType,
        authorName: processed.authorName,
        isPublic: true,
      });
      
      successCount++;
      console.log(`  ✅ "${processed.title}" (${processed.ageRange}) - Saved`);
    } catch (error) {
      console.error(`  ❌ Failed:`, error);
    }
    if (i < 9) await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n🇩🇪 German originals (5 more)...");
  for (let i = 5; i < 10; i++) {
    console.log(`\n[${i + 1}/10] Generating German original...`);
    try {
      const processed = await processWithRetry(() => generateOriginalStory("de", i));
      
      await db.insert(stories).values({
        title: processed.title,
        summary: processed.summary,
        moral: processed.moral,
        fullContent: processed.fullContent,
        imageUrl: getImageUrl(105 + successCount),
        ageRange: processed.ageRange,
        language: processed.language,
        isTranslated: false,
        originalLanguage: processed.language,
        sourceType: processed.sourceType,
        authorName: processed.authorName,
        isPublic: true,
      });
      
      successCount++;
      console.log(`  ✅ "${processed.title}" (${processed.ageRange}) - Saved`);
    } catch (error) {
      console.error(`  ❌ Failed:`, error);
    }
    if (i < 9) await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n✨ Session 4B Complete: ${successCount}/15 AI-original stories saved ✨`);
  console.log(`\n🎉 ALL 120 STORIES COMPLETE! 🎉`);
  console.log(`📚 Your StoryScroll library is ready! 🌙✨\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
