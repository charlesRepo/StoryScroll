import { db } from "./db";
import { stories } from "@shared/schema";
import {
  infant_titles_en,
  infant_titles_fr,
  older_titles_en,
  older_titles_fr,
} from "./storyTitleBanks";
import OpenAI from "openai";

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

async function generateStory(title: string, theme: string, language: "en" | "fr", ageRange: "0-2 years" | "6-10 years"): Promise<GeneratedStory> {
  const langName = language === "en" ? "English" : "French";
  
  const isInfant = ageRange === "0-2 years";
  
  const prompt = isInfant ? 
    `You are writing a bedtime story for infants and toddlers (0-2 years old).

Title: ${title}
Theme: ${theme}
Language: ${langName}

CRITICAL REQUIREMENTS:
- Length: 120-220 words ONLY
- NO moral lesson, NO teaching, NO life lessons whatsoever
- This is PURE sensory storytelling

FORBIDDEN WORDS/PHRASES (do NOT use):
- Any form of "learn", "taught", "lesson", "important", "should", "must"
- Phrases like "realized that", "understood that", "the right thing"

The story should:
- Use simple vocabulary and short sentences
- Include gentle repetition and rhythm
- Focus only on sensory experiences (soft, warm, gentle, quiet, cozy, etc.)
- End with a peaceful, sleepy conclusion

Respond in JSON format:
{
  "title": "Story title in ${langName}",
  "summary": "2-3 sentence summary (max 50 words)",
  "fullContent": "Complete sensory story (120-220 words)",
  "moral": ""
}` :
    `You are writing a realistic bedtime story for children aged 6-10 years old.

Title: ${title}
Theme: ${theme}
Language: ${langName}

CRITICAL REQUIREMENTS:
- Length: 450-650 words
- MUST include a clear moral lesson
- Realistic modern-day setting

The story should:
- Feature realistic situations from a child's life
- Include dialogue and character emotions
- Show clear cause and effect
- End with a meaningful lesson learned

Respond in JSON format:
{
  "title": "Story title in ${langName}",
  "summary": "Engaging summary (max 70 words)",
  "fullContent": "Complete realistic story (450-650 words)",
  "moral": "Clear, concise moral lesson"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");

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
  
  if (isInfant) {
    if (wordCount < 120) {
      story.validationReason = `Too short: ${wordCount} words`;
    } else if (wordCount > 220) {
      story.validationReason = `Too long: ${wordCount} words`;
    } else if (story.moral && story.moral.trim().length > 0) {
      story.validationReason = "Has explicit moral field";
    } else if (detectMoralInText(story.fullContent) || detectMoralInText(story.summary)) {
      story.validationReason = "Contains moral keywords";
    } else {
      story.isValid = true;
    }
  } else {
    if (wordCount < 450) {
      story.validationReason = `Too short: ${wordCount} words`;
    } else if (wordCount > 650) {
      story.validationReason = `Too long: ${wordCount} words`;
    } else if (!story.moral || story.moral.trim().length === 0) {
      story.validationReason = "Missing moral";
    } else {
      story.isValid = true;
    }
  }
  
  return story;
}

async function generateBatch() {
  const args = process.argv.slice(2);
  const type = args[0]; // "infant-en", "infant-fr", "older-en", "older-fr"
  const startIdx = parseInt(args[1] || "0");
  const count = parseInt(args[2] || "5");
  
  console.log(`Generating batch: ${type}, starting at index ${startIdx}, count ${count}\n`);
  
  let titles: any[];
  let language: "en" | "fr";
  let ageRange: "0-2 years" | "6-10 years";
  
  if (type === "infant-en") {
    titles = infant_titles_en;
    language = "en";
    ageRange = "0-2 years";
  } else if (type === "infant-fr") {
    titles = infant_titles_fr;
    language = "fr";
    ageRange = "0-2 years";
  } else if (type === "older-en") {
    titles = older_titles_en;
    language = "en";
    ageRange = "6-10 years";
  } else if (type === "older-fr") {
    titles = older_titles_fr;
    language = "fr";
    ageRange = "6-10 years";
  } else {
    console.error("Usage: npx tsx server/generateBatch.ts <type> <startIdx> <count>");
    console.error("Types: infant-en, infant-fr, older-en, older-fr");
    process.exit(1);
  }
  
  const batch = titles.slice(startIdx, startIdx + count);
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < batch.length; i++) {
    const theme = batch[i];
    console.log(`\n[${i + 1}/${batch.length}] ${theme.title}`);
    
    let validStory: GeneratedStory | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const story = await generateStory(theme.title, theme.theme, language, ageRange);
        
        if (!story.isValid) {
          console.log(`⚠️  Attempt ${attempt}/3 invalid: ${story.validationReason}`);
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          } else {
            failed++;
            break;
          }
        }
        
        validStory = story;
        break;
      } catch (error) {
        console.error(`❌ Attempt ${attempt}/3 failed: ${error}`);
        if (attempt === 3) failed++;
      }
    }
    
    if (validStory) {
      await db.insert(stories).values({
        title: validStory.title,
        summary: validStory.summary,
        moral: ageRange === "0-2 years" ? null : validStory.moral,
        fullContent: validStory.fullContent,
        imageUrl: "https://images.unsplash.com/photo-1516416615694-856c1e7a4ba7?w=400",
        ageRange,
        language,
        isTranslated: false,
        originalLanguage: language,
        sourceType: "curated",
        authorName: "StoryScroll Team",
        isPublic: true,
      });
      
      success++;
      console.log(`✅ Generated (${validStory.wordCount} words)`);
      if (validStory.moral) {
        console.log(`   Moral: ${validStory.moral.substring(0, 60)}...`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n✅ Complete! Success: ${success}, Failed: ${failed}`);
}

generateBatch();
