import { db } from "./db";
import { stories } from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateStoryFromTitle } from "./aiStoryHelpers";
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

async function main() {
  console.log("🇫🇷 Starting French story generation...\n");
  console.log("This will generate 30 classical French bedtime stories");
  console.log("and automatically categorize them by age group.\n");
  console.log("=" .repeat(60));
  
  const titlesPath = path.join(process.cwd(), "attached_assets", "Pasted--Titre-Auteur--1762732815772_1762732815772.txt");
  const frenchTitles = parseFrenchTitlesFile(titlesPath);
  
  console.log(`\nFound ${frenchTitles.length} French stories to generate\n`);
  
  const results = {
    success: 0,
    failed: 0,
    byAge: {} as Record<string, number>,
  };
  
  for (let i = 0; i < frenchTitles.length; i++) {
    const { title, author } = frenchTitles[i];
    console.log(`[${i + 1}/${frenchTitles.length}] ${title} by ${author}`);
    
    try {
      const story = await generateStoryFromTitle(title, author, "fr");
      
      const imageUrl = `https://images.unsplash.com/photo-1516416615694-856c1e7a4ba7?w=400`;
      
      await db.insert(stories).values({
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
      });
      
      results.success++;
      results.byAge[story.ageRange] = (results.byAge[story.ageRange] || 0) + 1;
      console.log(`✅ Generated (${story.ageRange})\n`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.failed++;
      console.error(`❌ Failed: ${error}\n`);
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 French Story Generation Complete!\n");
  console.log(`Successfully generated: ${results.success}/${frenchTitles.length}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`\nDistribution by age group:`);
  console.log(JSON.stringify(results.byAge, null, 2));
  
  // Show final database stats
  const allFrench = await db.select().from(stories).where(eq(stories.language, "fr"));
  const finalByAge = allFrench.reduce((acc, s) => {
    acc[s.ageRange] = (acc[s.ageRange] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`\nTotal French stories in database:`);
  console.log(JSON.stringify(finalByAge, null, 2));
}

main().catch(console.error);
