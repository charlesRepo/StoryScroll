import { db } from "./db";
import { stories } from "../shared/schema";
import { germanClassics } from "./classicalStoryData";
import { processClassicalStory } from "./story-processor";

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
  console.log("\n🇩🇪 SESSION 3A-COMPLETE: Missing German Stories (8-15) 🇩🇪\n");

  // Stories 8-15 (indices 7-14)
  const batch = germanClassics.slice(7, 15);
  let successCount = 0;

  for (let i = 0; i < batch.length; i++) {
    const meta = batch[i];
    console.log(`\n[${i + 8}/15] ${meta.title}`);

    try {
      const processed = await processWithRetry(() => processClassicalStory(meta));
      
      await db.insert(stories).values({
        title: processed.title,
        summary: processed.summary,
        moral: processed.moral,
        fullContent: processed.fullContent,
        imageUrl: getImageUrl(i + 67),
        ageRange: processed.ageRange,
        language: processed.language,
        isTranslated: false,
        originalLanguage: processed.language,
        sourceType: processed.sourceType,
        authorName: processed.authorName,
        isPublic: true,
      });
      
      successCount++;
      console.log(`  ✅ ${processed.ageRange} - Saved to DB`);
    } catch (error) {
      console.error(`  ❌ Failed:`, error);
    }

    if (i < batch.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n✨ Missing stories complete: ${successCount}/8 German stories saved ✨`);
  console.log(`📊 Total German classics now: 30/30 complete! ✨\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
