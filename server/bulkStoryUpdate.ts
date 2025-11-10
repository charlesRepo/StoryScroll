import { db } from "./db";
import { stories } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  generateStoryFromTitle,
  categorizeStory,
  translateStory,
  batchCategorizeStories,
} from "./aiStoryHelpers";
import * as fs from "fs";
import * as path from "path";

interface FrenchStoryTitle {
  number: number;
  title: string;
  author: string;
}

function parseFrenchTitlesFile(filePath: string): FrenchStoryTitle[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const titles: FrenchStoryTitle[] = [];

  for (const line of lines) {
    if (line.startsWith("|") && !line.includes("Titre") && !line.includes("--")) {
      const parts = line.split("|").map(p => p.trim()).filter(p => p);
      if (parts.length >= 3) {
        const number = parseInt(parts[0]);
        const title = parts[1];
        const author = parts[2];
        
        if (!isNaN(number) && title && author) {
          titles.push({ number, title, author });
        }
      }
    }
  }

  return titles;
}

export async function generateFrenchStories() {
  console.log("🇫🇷 Starting French story generation...");
  
  const titlesPath = path.join(process.cwd(), "attached_assets", "Pasted--Titre-Auteur--1762732815772_1762732815772.txt");
  const frenchTitles = parseFrenchTitlesFile(titlesPath);
  
  console.log(`Found ${frenchTitles.length} French stories to generate`);
  
  const generatedStories = [];
  
  for (let i = 0; i < frenchTitles.length; i++) {
    const { title, author } = frenchTitles[i];
    console.log(`\n[${i + 1}/${frenchTitles.length}] Generating: ${title} by ${author}`);
    
    try {
      const story = await generateStoryFromTitle(title, author, "fr");
      
      const imageUrl = `https://images.unsplash.com/photo-1516416615694-856c1e7a4ba7?w=400`;
      
      const [insertedStory] = await db.insert(stories).values({
        title: story.title,
        summary: story.summary,
        moral: story.moral || null,
        fullContent: story.fullContent,
        imageUrl,
        ageRange: story.ageRange,
        language: "fr",
        isTranslated: false,
        originalLanguage: "fr",
        sourceType: "curated",
        authorName: author,
        isPublic: true,
      }).returning();
      
      generatedStories.push(insertedStory);
      console.log(`✅ Generated: ${story.title} (${story.ageRange})`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to generate ${title}:`, error);
    }
  }
  
  console.log(`\n✅ French story generation complete! Generated ${generatedStories.length}/${frenchTitles.length} stories`);
  return generatedStories;
}

export async function recategorizeAllStories() {
  console.log("\n📊 Starting story recategorization...");
  
  const allStories = await db.select().from(stories).where(eq(stories.sourceType, "curated"));
  
  console.log(`Found ${allStories.length} stories to recategorize`);
  
  const categorizations = await batchCategorizeStories(allStories);
  
  let updated = 0;
  for (const [storyId, analysis] of Array.from(categorizations.entries())) {
    const story = allStories.find(s => s.id === storyId);
    if (story && story.ageRange !== analysis.ageRange) {
      await db.update(stories)
        .set({ ageRange: analysis.ageRange })
        .where(eq(stories.id, storyId));
      
      console.log(`Updated "${story.title}" from ${story.ageRange} → ${analysis.ageRange}`);
      console.log(`  Reason: ${analysis.reasoning}`);
      updated++;
    }
  }
  
  console.log(`\n✅ Recategorization complete! Updated ${updated}/${allStories.length} stories`);
  
  const distribution = await db.select().from(stories).where(eq(stories.sourceType, "curated"));
  const byAge = distribution.reduce((acc, s) => {
    acc[s.ageRange] = (acc[s.ageRange] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log("\n📊 New distribution:");
  console.log(byAge);
  
  return { updated, distribution: byAge };
}

export async function translateFrenchToEnglish() {
  console.log("\n🇫🇷 → 🇬🇧 Translating French stories to English...");
  
  const frenchStories = await db.select().from(stories).where(eq(stories.language, "fr"));
  
  console.log(`Found ${frenchStories.length} French stories to translate`);
  
  let translated = 0;
  for (let i = 0; i < frenchStories.length; i++) {
    const frStory = frenchStories[i];
    
    const existing = await db.select().from(stories).where(
      eq(stories.title, frStory.title)
    );
    const hasEnglishVersion = existing.some(s => s.language === "en");
    
    if (hasEnglishVersion) {
      console.log(`⏭️  Skipping "${frStory.title}" - English version already exists`);
      continue;
    }
    
    console.log(`\n[${i + 1}/${frenchStories.length}] Translating: ${frStory.title}`);
    
    try {
      const translation = await translateStory(
        {
          title: frStory.title,
          summary: frStory.summary,
          moral: frStory.moral,
          fullContent: frStory.fullContent,
        },
        "en"
      );
      
      await db.insert(stories).values({
        title: translation.title,
        summary: translation.summary,
        moral: translation.moral || null,
        fullContent: translation.fullContent,
        imageUrl: frStory.imageUrl,
        ageRange: frStory.ageRange,
        language: "en",
        isTranslated: true,
        originalLanguage: "fr",
        sourceType: "curated",
        authorName: frStory.authorName,
        isPublic: true,
      });
      
      translated++;
      console.log(`✅ Translated: ${translation.title}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to translate ${frStory.title}:`, error);
    }
  }
  
  console.log(`\n✅ French → English translation complete! Translated ${translated} stories`);
  return translated;
}

export async function translateEnglishToFrench() {
  console.log("\n🇬🇧 → 🇫🇷 Translating English stories to French...");
  
  const englishStories = await db.select().from(stories)
    .where(eq(stories.language, "en"));
  
  console.log(`Found ${englishStories.length} English stories`);
  
  let translated = 0;
  for (let i = 0; i < englishStories.length; i++) {
    const enStory = englishStories[i];
    
    const existing = await db.select().from(stories).where(
      eq(stories.title, enStory.title)
    );
    const hasFrenchVersion = existing.some(s => s.language === "fr");
    
    if (hasFrenchVersion) {
      console.log(`⏭️  Skipping "${enStory.title}" - French version exists`);
      continue;
    }
    
    console.log(`\n[${i + 1}/${englishStories.length}] Translating: ${enStory.title}`);
    
    try {
      const translation = await translateStory(
        {
          title: enStory.title,
          summary: enStory.summary,
          moral: enStory.moral,
          fullContent: enStory.fullContent,
        },
        "fr"
      );
      
      await db.insert(stories).values({
        title: translation.title,
        summary: translation.summary,
        moral: translation.moral || null,
        fullContent: translation.fullContent,
        imageUrl: enStory.imageUrl,
        ageRange: enStory.ageRange,
        language: "fr",
        isTranslated: true,
        originalLanguage: "en",
        sourceType: "curated",
        authorName: enStory.authorName,
        isPublic: true,
      });
      
      translated++;
      console.log(`✅ Translated: ${translation.title}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to translate ${enStory.title}:`, error);
    }
  }
  
  console.log(`\n✅ English → French translation complete! Translated ${translated} stories`);
  return translated;
}

async function main() {
  try {
    console.log("🚀 Starting bulk story update process...\n");
    console.log("=" .repeat(60));
    
    const step1 = await generateFrenchStories();
    console.log("\n" + "=".repeat(60));
    
    await recategorizeAllStories();
    console.log("\n" + "=".repeat(60));
    
    await translateFrenchToEnglish();
    console.log("\n" + "=".repeat(60));
    
    const translatedCount = await translateEnglishToFrench();
    console.log("\n" + "=".repeat(60));
    
    const finalStats = await db.select().from(stories);
    const statsByLang = finalStats.reduce((acc, s) => {
      if (!acc[s.language]) acc[s.language] = {};
      acc[s.language][s.ageRange] = (acc[s.language][s.ageRange] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<string, number>>);
    
    console.log("\n🎉 BULK UPDATE COMPLETE!");
    console.log("\nFinal Statistics:");
    console.log(JSON.stringify(statsByLang, null, 2));
    
  } catch (error) {
    console.error("❌ Bulk update failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
