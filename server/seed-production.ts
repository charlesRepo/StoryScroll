import { db } from "./db";
import { stories } from "../shared/schema";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Production Seed Script
 * 
 * This script loads stories from story-library.json and inserts them into the database.
 * Use this to populate production databases or reset development databases.
 * 
 * Usage:
 *   tsx server/seed-production.ts
 */

interface StorySeedData {
  title: string;
  summary: string;
  moral: string;
  fullContent: string;
  imageUrl: string;
  ageRange: "2-4 years" | "5-6 years" | "7-8 years";
  language: "en" | "fr" | "de";
  authorName: string;
  sourceType: "classical" | "ai-generated";
}

async function seedProduction() {
  console.log("\n🌙 StoryScroll - Production Database Seeder 🌙\n");

  const jsonPath = join(process.cwd(), "server", "story-library.json");

  if (!existsSync(jsonPath)) {
    console.error("❌ Error: story-library.json not found!");
    console.error("   Run 'tsx server/seed-stories-batch.ts' first to generate the library.");
    process.exit(1);
  }

  console.log("📖 Loading stories from story-library.json...");
  const storyData: StorySeedData[] = JSON.parse(
    readFileSync(jsonPath, "utf-8")
  );

  console.log(`   Found ${storyData.length} stories to import`);

  // Clear existing stories
  console.log("\n🗑️  Clearing existing stories...");
  await db.delete(stories);
  console.log("   ✅ Database cleared");

  // Insert stories
  console.log("\n💿 Inserting stories into database...");
  let inserted = 0;

  for (const story of storyData) {
    try {
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
      inserted++;

      if (inserted % 10 === 0) {
        console.log(`   Inserted ${inserted}/${storyData.length} stories...`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to insert story "${story.title}":`, error);
    }
  }

  console.log(`\n   ✅ Successfully inserted ${inserted} stories`);

  // Summary statistics
  const stats = {
    total: inserted,
    byLanguage: {
      en: storyData.filter((s) => s.language === "en").length,
      fr: storyData.filter((s) => s.language === "fr").length,
      de: storyData.filter((s) => s.language === "de").length,
    },
    byAge: {
      "2-4": storyData.filter((s) => s.ageRange === "2-4 years").length,
      "5-6": storyData.filter((s) => s.ageRange === "5-6 years").length,
      "7-8": storyData.filter((s) => s.ageRange === "7-8 years").length,
    },
    byType: {
      classical: storyData.filter((s) => s.sourceType === "classical").length,
      ai: storyData.filter((s) => s.sourceType === "ai-generated").length,
    },
  };

  console.log("\n📊 Database Summary:");
  console.log(`  Total Stories: ${stats.total}`);
  console.log(
    `  Languages: EN=${stats.byLanguage.en}, FR=${stats.byLanguage.fr}, DE=${stats.byLanguage.de}`
  );
  console.log(
    `  Age Ranges: 2-4=${stats.byAge["2-4"]}, 5-6=${stats.byAge["5-6"]}, 7-8=${stats.byAge["7-8"]}`
  );
  console.log(
    `  Types: Classical=${stats.byType.classical}, AI-Original=${stats.byType.ai}`
  );

  console.log("\n✨ Production database seeded successfully! ✨\n");
}

seedProduction()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
