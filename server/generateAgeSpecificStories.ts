import OpenAI from "openai";
import { db } from "./db";
import { stories } from "@shared/schema";
import {
  infant_titles_en,
  infant_titles_fr,
  older_titles_en,
  older_titles_fr,
  type StoryTheme,
} from "./storyTitleBanks";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GeneratedStory {
  title: string;
  summary: string;
  moral: string;
  fullContent: string;
  hasMoral: boolean;
  wordCount: number;
  isValid: boolean;
  validationReason?: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

function detectMoralInText(text: string): boolean {
  // Only detect explicit moral teaching patterns, not common words
  const strongMoralPatterns = [
    /\blearned? (that|a lesson|an? important)/i,
    /\btaught (that|about|a lesson)/i,
    /\bthe lesson (is|was|of)/i,
    /\bshould (always|never)/i,
    /\bmust (always|never)/i,
    /\bit('s| is) important to/i,
    /\bthe right thing/i,
    /\bdoing the right/i,
    /\brealized? (that|how important)/i,
    /\bunderstood (that|the importance)/i,
    /\bappris (que|la leçon)/i,
    /\benseigné (que|la leçon)/i,
    /\bla leçon (est|était)/i,
    /\bil faut (toujours|jamais)/i,
    /\bc'est important de/i,
  ];
  
  return strongMoralPatterns.some(pattern => pattern.test(text));
}

function validateInfantStory(story: GeneratedStory): { isValid: boolean; reason?: string } {
  const wordCount = countWords(story.fullContent);
  
  // Check word count (120-220 words)
  if (wordCount < 120) {
    return { isValid: false, reason: `Too short: ${wordCount} words (min 120)` };
  }
  if (wordCount > 220) {
    return { isValid: false, reason: `Too long: ${wordCount} words (max 220)` };
  }
  
  // Check for moral in JSON field
  if (story.moral && story.moral.trim().length > 0) {
    return { isValid: false, reason: "Has explicit moral field" };
  }
  
  // Analyze full content for moral indicators
  if (detectMoralInText(story.fullContent) || detectMoralInText(story.summary)) {
    return { isValid: false, reason: "Contains moral keywords in content" };
  }
  
  return { isValid: true };
}

function validateOlderStory(story: GeneratedStory): { isValid: boolean; reason?: string } {
  const wordCount = countWords(story.fullContent);
  
  // Check word count (450-650 words)
  if (wordCount < 450) {
    return { isValid: false, reason: `Too short: ${wordCount} words (min 450)` };
  }
  if (wordCount > 650) {
    return { isValid: false, reason: `Too long: ${wordCount} words (max 650)` };
  }
  
  // Must have moral
  if (!story.moral || story.moral.trim().length === 0) {
    return { isValid: false, reason: "Missing moral lesson" };
  }
  
  return { isValid: true };
}

async function generateInfantStory(
  theme: StoryTheme
): Promise<GeneratedStory> {
  const langName = theme.language === "en" ? "English" : "French";
  
  const prompt = `You are writing a bedtime story for infants and toddlers (0-2 years old).

Title: ${theme.title}
Theme: ${theme.theme}
Language: ${langName}

CRITICAL REQUIREMENTS:
- Length: 120-220 words ONLY (very short for infant attention spans)
- NO moral lesson, NO teaching, NO life lessons whatsoever
- This is PURE sensory storytelling - just describe what happens with soothing words
- Simple, soothing, repetitive language
- Focus on gentle imagery, soft sounds, calming sensations
- Perfect for bedtime reading to very young children

FORBIDDEN WORDS/PHRASES (do NOT use):
- Any form of "learn", "taught", "lesson", "important", "should", "must"
- Phrases like "realized that", "understood that", "the right thing"
- Any conclusion that teaches or implies a message
- NO character growth or development - just peaceful experiences

The story should:
- Use simple vocabulary and short sentences
- Include gentle repetition and rhythm
- Be calming and sleep-inducing
- Focus only on sensory experiences (soft, warm, gentle, quiet, cozy, etc.)
- End with a peaceful, sleepy conclusion
- Just describe what the character sees, feels, hears - nothing more

Respond in JSON format:
{
  "title": "Story title in ${langName}",
  "summary": "2-3 sentence summary (max 50 words)",
  "fullContent": "Complete sensory story (120-220 words) with NO teaching elements",
  "moral": "" // ALWAYS empty for this age group
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const data = JSON.parse(content);
  const wordCount = countWords(data.fullContent);
  const hasMoral = data.moral && data.moral.trim().length > 0;
  
  const story: GeneratedStory = {
    title: data.title,
    summary: data.summary,
    moral: "", // Force empty
    fullContent: data.fullContent,
    hasMoral,
    wordCount,
    isValid: false,
  };
  
  // Validate the story
  const validation = validateInfantStory(story);
  story.isValid = validation.isValid;
  story.validationReason = validation.reason;
  
  return story;
}

async function generateOlderStory(
  theme: StoryTheme
): Promise<GeneratedStory> {
  const langName = theme.language === "en" ? "English" : "French";
  
  const prompt = `You are writing a realistic bedtime story for children aged 6-10 years old.

Title: ${theme.title}
Theme: ${theme.theme}
Language: ${langName}

CRITICAL REQUIREMENTS:
- Length: 450-650 words (substantial story with depth)
- MUST include a clear moral lesson about ${theme.theme}
- Realistic modern-day setting (school, home, playground, neighborhood)
- Age-appropriate challenges and consequences
- Characters children can relate to

The story should:
- Feature realistic situations from a child's life
- Include dialogue and character emotions
- Show clear cause and effect
- End with a meaningful lesson learned
- Be engaging but suitable for bedtime

Respond in JSON format:
{
  "title": "Story title in ${langName}",
  "summary": "Engaging summary showing the moral dilemma (max 70 words)",
  "fullContent": "Complete realistic story (450-650 words)",
  "moral": "Clear, concise moral lesson (1-2 sentences)"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const data = JSON.parse(content);
  const wordCount = countWords(data.fullContent);
  const hasMoral = data.moral && data.moral.trim().length > 0;
  
  const story: GeneratedStory = {
    title: data.title,
    summary: data.summary,
    moral: data.moral || "",
    fullContent: data.fullContent,
    hasMoral,
    wordCount,
    isValid: false,
  };
  
  // Validate the story
  const validation = validateOlderStory(story);
  story.isValid = validation.isValid;
  story.validationReason = validation.reason;
  
  return story;
}

async function generateInfantStories(count: number = 15) {
  console.log(`\n👶 Generating ${count} infant stories (0-2 years)...`);
  console.log("=" .repeat(60));
  
  const results = {
    en: { success: 0, failed: 0, skippedNoMoral: 0 },
    fr: { success: 0, failed: 0, skippedNoMoral: 0 },
  };
  
  const enThemes = infant_titles_en.slice(0, count);
  const frThemes = infant_titles_fr.slice(0, count);
  
  // Generate English stories with retry logic
  for (let i = 0; i < enThemes.length; i++) {
    const theme = enThemes[i];
    console.log(`\n[EN ${i + 1}/${enThemes.length}] ${theme.title}`);
    
    const maxRetries = 3;
    let validStory: GeneratedStory | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const story = await generateInfantStory(theme);
        
        if (!story.isValid) {
          console.log(`⚠️  Attempt ${attempt}/${maxRetries} invalid: ${story.validationReason}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          } else {
            results.en.skippedNoMoral++;
            break;
          }
        }
        
        validStory = story;
        break;
      } catch (error) {
        console.error(`❌ Attempt ${attempt}/${maxRetries} failed: ${error}`);
        if (attempt === maxRetries) {
          results.en.failed++;
        }
      }
    }
    
    if (validStory) {
      const imageUrl = `https://images.unsplash.com/photo-1516416615694-856c1e7a4ba7?w=400`;
      
      await db.insert(stories).values({
        title: validStory.title,
        summary: validStory.summary,
        moral: null,
        fullContent: validStory.fullContent,
        imageUrl,
        ageRange: "0-2 years",
        language: "en",
        isTranslated: false,
        originalLanguage: "en",
        sourceType: "curated",
        authorName: "StoryScroll Team",
        isPublic: true,
      });
      
      results.en.success++;
      console.log(`✅ Generated (${validStory.wordCount} words)`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Generate French stories with retry logic
  for (let i = 0; i < frThemes.length; i++) {
    const theme = frThemes[i];
    console.log(`\n[FR ${i + 1}/${frThemes.length}] ${theme.title}`);
    
    const maxRetries = 3;
    let validStory: GeneratedStory | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const story = await generateInfantStory(theme);
        
        if (!story.isValid) {
          console.log(`⚠️  Attempt ${attempt}/${maxRetries} invalid: ${story.validationReason}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          } else {
            results.fr.skippedNoMoral++;
            break;
          }
        }
        
        validStory = story;
        break;
      } catch (error) {
        console.error(`❌ Attempt ${attempt}/${maxRetries} failed: ${error}`);
        if (attempt === maxRetries) {
          results.fr.failed++;
        }
      }
    }
    
    if (validStory) {
      const imageUrl = `https://images.unsplash.com/photo-1516416615694-856c1e7a4ba7?w=400`;
      
      await db.insert(stories).values({
        title: validStory.title,
        summary: validStory.summary,
        moral: null,
        fullContent: validStory.fullContent,
        imageUrl,
        ageRange: "0-2 years",
        language: "fr",
        isTranslated: false,
        originalLanguage: "fr",
        sourceType: "curated",
        authorName: "StoryScroll Team",
        isPublic: true,
      });
      
      results.fr.success++;
      console.log(`✅ Generated (${validStory.wordCount} words)`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 Infant Story Generation Complete!");
  console.log(`\nEnglish: ${results.en.success} success, ${results.en.failed} failed, ${results.en.skippedNoMoral} skipped (had morals)`);
  console.log(`French: ${results.fr.success} success, ${results.fr.failed} failed, ${results.fr.skippedNoMoral} skipped (had morals)`);
  
  return results;
}

async function generateOlderStories(count: number = 15) {
  console.log(`\n📚 Generating ${count} stories for older children (6-10 years)...`);
  console.log("=" .repeat(60));
  
  const results = {
    en: { success: 0, failed: 0, skippedNoMoral: 0 },
    fr: { success: 0, failed: 0, skippedNoMoral: 0 },
  };
  
  const enThemes = older_titles_en.slice(0, count);
  const frThemes = older_titles_fr.slice(0, count);
  
  // Generate English stories with retry logic
  for (let i = 0; i < enThemes.length; i++) {
    const theme = enThemes[i];
    console.log(`\n[EN ${i + 1}/${enThemes.length}] ${theme.title}`);
    
    const maxRetries = 3;
    let validStory: GeneratedStory | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const story = await generateOlderStory(theme);
        
        if (!story.isValid) {
          console.log(`⚠️  Attempt ${attempt}/${maxRetries} invalid: ${story.validationReason}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          } else {
            results.en.skippedNoMoral++;
            break;
          }
        }
        
        validStory = story;
        break;
      } catch (error) {
        console.error(`❌ Attempt ${attempt}/${maxRetries} failed: ${error}`);
        if (attempt === maxRetries) {
          results.en.failed++;
        }
      }
    }
    
    if (validStory) {
      const imageUrl = `https://images.unsplash.com/photo-1516416615694-856c1e7a4ba7?w=400`;
      
      await db.insert(stories).values({
        title: validStory.title,
        summary: validStory.summary,
        moral: validStory.moral,
        fullContent: validStory.fullContent,
        imageUrl,
        ageRange: "6-10 years",
        language: "en",
        isTranslated: false,
        originalLanguage: "en",
        sourceType: "curated",
        authorName: "StoryScroll Team",
        isPublic: true,
      });
      
      results.en.success++;
      console.log(`✅ Generated (${validStory.wordCount} words)`);
      console.log(`   Moral: ${validStory.moral.substring(0, 60)}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Generate French stories with retry logic
  for (let i = 0; i < frThemes.length; i++) {
    const theme = frThemes[i];
    console.log(`\n[FR ${i + 1}/${frThemes.length}] ${theme.title}`);
    
    const maxRetries = 3;
    let validStory: GeneratedStory | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const story = await generateOlderStory(theme);
        
        if (!story.isValid) {
          console.log(`⚠️  Attempt ${attempt}/${maxRetries} invalid: ${story.validationReason}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          } else {
            results.fr.skippedNoMoral++;
            break;
          }
        }
        
        validStory = story;
        break;
      } catch (error) {
        console.error(`❌ Attempt ${attempt}/${maxRetries} failed: ${error}`);
        if (attempt === maxRetries) {
          results.fr.failed++;
        }
      }
    }
    
    if (validStory) {
      const imageUrl = `https://images.unsplash.com/photo-1516416615694-856c1e7a4ba7?w=400`;
      
      await db.insert(stories).values({
        title: validStory.title,
        summary: validStory.summary,
        moral: validStory.moral,
        fullContent: validStory.fullContent,
        imageUrl,
        ageRange: "6-10 years",
        language: "fr",
        isTranslated: false,
        originalLanguage: "fr",
        sourceType: "curated",
        authorName: "StoryScroll Team",
        isPublic: true,
      });
      
      results.fr.success++;
      console.log(`✅ Generated (${validStory.wordCount} words)`);
      console.log(`   Moral: ${validStory.moral.substring(0, 60)}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 Older Children Story Generation Complete!");
  console.log(`\nEnglish: ${results.en.success} success, ${results.en.failed} failed, ${results.en.skippedNoMoral} skipped (no moral)`);
  console.log(`French: ${results.fr.success} success, ${results.fr.failed} failed, ${results.fr.skippedNoMoral} skipped (no moral)`);
  
  return results;
}

async function main() {
  try {
    console.log("🚀 Starting Age-Specific Story Generation\n");
    console.log("This will create stories for underrepresented age groups:");
    console.log("- 0-2 years: Simple sensory stories (NO morals)");
    console.log("- 6-10 years: Realistic stories (WITH morals)\n");
    
    // Generate infant stories
    await generateInfantStories(15);
    
    console.log("\n");
    
    // Generate older children stories
    await generateOlderStories(15);
    
    // Show final statistics
    const allStories = await db.select().from(stories);
    const distribution = allStories.reduce((acc, s) => {
      const key = `${s.language}-${s.ageRange}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("\n" + "=".repeat(60));
    console.log("\n📊 Final Story Distribution:");
    console.log(JSON.stringify(distribution, null, 2));
    
  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

// Run if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main();
}

export { generateInfantStories, generateOlderStories };
