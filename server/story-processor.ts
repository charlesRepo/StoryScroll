import OpenAI from "openai";
import type { ClassicalStoryMeta } from "./classicalStoryData";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ProcessedStory {
  title: string;
  summary: string;
  moral: string;
  fullContent: string;
  ageRange: "2-4 years" | "5-6 years" | "7-8 years";
  language: "en" | "fr" | "de";
  authorName: string;
  sourceType: "classical" | "ai-generated";
}

// AI-powered story processor that creates bedtime-appropriate adaptations
export async function processClassicalStory(
  meta: ClassicalStoryMeta
): Promise<ProcessedStory> {
  console.log(`Processing: ${meta.title} by ${meta.author}`);

  // Step 1: Create bedtime-appropriate adaptation
  const adaptation = await createBedtimeAdaptation(meta);

  // Step 2: Categorize by age based on content complexity
  const ageRange = await categorizeByAge(adaptation, meta.language);

  // Step 3: Generate age-appropriate moral
  const moral = await generateMoral(adaptation, ageRange, meta.language);

  return {
    title: meta.title,
    summary: adaptation.summary,
    moral,
    fullContent: adaptation.fullContent,
    ageRange,
    language: meta.language,
    authorName: `adapted from ${meta.author}`,
    sourceType: "classical",
  };
}

// Create bedtime-appropriate adaptation preserving the story's essence
async function createBedtimeAdaptation(meta: ClassicalStoryMeta): Promise<{
  summary: string;
  fullContent: string;
}> {
  const languageInstructions = {
    en: "in English",
    fr: "en français",
    de: "auf Deutsch",
  };

  const prompt = `You are creating a bedtime story adaptation of a classical tale ${languageInstructions[meta.language]}.

Original Story: "${meta.title}" by ${meta.author}
Description: ${meta.description}

Create a bedtime-appropriate adaptation that:
1. Preserves the essence and key plot points of the original
2. Uses gentle, soothing language suitable for bedtime
3. Maintains cultural authenticity and the author's spirit
4. Is appropriate for children ages 2-8
5. Has a peaceful, sleep-friendly ending

Provide:
1. Summary (50-70 words max): A gentle introduction to the story
2. Full Story (300-600 words): The complete bedtime-appropriate narrative

Format your response as JSON:
{
  "summary": "...",
  "fullContent": "..."
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content returned from OpenAI");
  }

  const result = JSON.parse(content);
  
  // Validate required fields
  if (!result.summary || typeof result.summary !== "string" || result.summary.trim().length === 0) {
    throw new Error("Invalid or missing summary in AI response");
  }
  
  if (!result.fullContent || typeof result.fullContent !== "string" || result.fullContent.trim().length === 0) {
    throw new Error("Invalid or missing fullContent in AI response");
  }

  // Validate content length (minimum quality check)
  if (result.summary.length < 30) {
    throw new Error("Summary too short (min 30 characters)");
  }
  
  if (result.fullContent.length < 200) {
    throw new Error("Full content too short (min 200 characters)");
  }

  return {
    summary: result.summary.trim(),
    fullContent: result.fullContent.trim(),
  };
}

// Categorize story by age based on content analysis
async function categorizeByAge(
  story: { summary: string; fullContent: string },
  language: string
): Promise<"2-4 years" | "5-6 years" | "7-8 years"> {
  const prompt = `Analyze this bedtime story and categorize it by age appropriateness.

Story Summary: ${story.summary}
Full Story: ${story.fullContent}

Age Categories:
- 2-4 years: Pure fantasy, simple concepts, sensory experiences, very short sentences, no complex morals
- 5-6 years: Fantasy with gentle lessons, moderate complexity, some cause/effect, simple morals
- 7-8 years: Reality-based lessons, complex themes, character development, clear morals

Analyze: vocabulary complexity, sentence structure, themes, emotional depth, and concept difficulty.

Respond with ONLY the age range: "2-4 years", "5-6 years", or "7-8 years"`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const ageRange = response.choices[0].message.content?.trim() || "5-6 years";

  if (
    ageRange === "2-4 years" ||
    ageRange === "5-6 years" ||
    ageRange === "7-8 years"
  ) {
    return ageRange;
  }

  return "5-6 years"; // Default fallback
}

// Generate age-appropriate moral
async function generateMoral(
  story: { fullContent: string },
  ageRange: string,
  language: string
): Promise<string> {
  const languageInstructions: Record<string, string> = {
    en: "in English",
    fr: "en français",
    de: "auf Deutsch",
  };

  const moralGuidance: Record<string, string> = {
    "2-4 years":
      "Very gentle, simple concepts like kindness, sharing, or courage. 1 sentence max.",
    "5-6 years":
      "Moderate lessons about friendship, honesty, or perseverance. 1-2 sentences.",
    "7-8 years":
      "Stronger life lessons about responsibility, consequences, or character. 2-3 sentences.",
  };

  const prompt = `Based on this bedtime story, create an age-appropriate moral ${languageInstructions[language]}.

Story: ${story.fullContent}

Age Range: ${ageRange}
Moral Guidelines: ${moralGuidance[ageRange as keyof typeof moralGuidance]}

Create a warm, gentle moral that captures the story's lesson. Keep it brief and age-appropriate.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content?.trim() || "";
}

// Generate original AI story
export async function generateOriginalStory(
  language: "en" | "fr" | "de",
  index: number
): Promise<ProcessedStory> {
  const languageInstructions: Record<string, string> = {
    en: "in English",
    fr: "en français",
    de: "auf Deutsch",
  };

  const themes = [
    "a magical adventure",
    "friendship and kindness",
    "courage and bravery",
    "nature and animals",
    "dreams and imagination",
    "family and love",
    "helping others",
    "solving problems creatively",
    "discovering hidden talents",
    "learning from mistakes",
  ];

  const theme = themes[index % themes.length];

  const prompt = `Create an original bedtime story ${languageInstructions[language]} about ${theme}.

Requirements:
1. Completely original characters and plot
2. Gentle, soothing narrative perfect for bedtime
3. Appropriate for children ages 2-8
4. Peaceful, satisfying ending
5. Length: 300-600 words

Provide:
1. Title: Creative and engaging
2. Summary (50-70 words): Gentle introduction
3. Full Story (300-600 words): Complete narrative
4. Age Range: Choose "2-4 years", "5-6 years", or "7-8 years" based on complexity
5. Moral: Age-appropriate lesson (1-3 sentences)

Format as JSON:
{
  "title": "...",
  "summary": "...",
  "fullContent": "...",
  "ageRange": "...",
  "moral": "..."
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content returned from OpenAI for original story");
  }

  const result = JSON.parse(content);

  // Validate all required fields
  if (!result.title || typeof result.title !== "string" || result.title.trim().length === 0) {
    throw new Error("Invalid or missing title in AI response");
  }

  if (!result.summary || typeof result.summary !== "string" || result.summary.trim().length < 30) {
    throw new Error("Invalid or missing summary in AI response (min 30 chars)");
  }

  if (!result.fullContent || typeof result.fullContent !== "string" || result.fullContent.trim().length < 200) {
    throw new Error("Invalid or missing fullContent in AI response (min 200 chars)");
  }

  if (!result.moral || typeof result.moral !== "string" || result.moral.trim().length === 0) {
    throw new Error("Invalid or missing moral in AI response");
  }

  // Validate age range
  const validAgeRanges = ["2-4 years", "5-6 years", "7-8 years"];
  if (!result.ageRange || !validAgeRanges.includes(result.ageRange)) {
    result.ageRange = "5-6 years"; // Safe fallback
  }

  return {
    title: result.title.trim(),
    summary: result.summary.trim(),
    moral: result.moral.trim(),
    fullContent: result.fullContent.trim(),
    ageRange: result.ageRange as "2-4 years" | "5-6 years" | "7-8 years",
    language,
    authorName: "StoryScroll Team",
    sourceType: "ai-generated",
  };
}
