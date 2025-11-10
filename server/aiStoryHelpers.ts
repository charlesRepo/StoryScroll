import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CategoryAnalysis {
  ageRange: "0-2 years" | "3-5 years" | "6-10 years";
  reasoning: string;
}

interface TranslatedStory {
  title: string;
  summary: string;
  moral: string;
  fullContent: string;
}

interface GeneratedStory {
  title: string;
  summary: string;
  moral: string;
  fullContent: string;
  ageRange: "0-2 years" | "3-5 years" | "6-10 years";
}

export async function categorizeStory(
  title: string,
  summary: string,
  moral: string | null,
  fullContent: string
): Promise<CategoryAnalysis> {
  const prompt = `You are an expert in child development and children's literature. Analyze the following bedtime story and categorize it into the appropriate age group based on these criteria:

**0-2 years**: Stories with pure fantasy themes - magic, simple creatures, wonder and imagination with no moral lessons. Focus on sensory experiences, simple emotions, and magical elements.

**3-5 years**: Stories that combine fantasy with beginning moral lessons. Mix of magical elements with simple life lessons about kindness, sharing, courage, etc.

**6-10 years**: Stories with realistic themes and strong moral lessons. Focus on real-world situations, character development, consequences of actions, and clear moral teachings.

Story Title: ${title}
Summary: ${summary}
Moral: ${moral || "None"}
Full Content: ${fullContent.substring(0, 1000)}...

Respond in JSON format:
{
  "ageRange": "0-2 years" | "3-5 years" | "6-10 years",
  "reasoning": "Brief explanation of why this story fits this age group"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as CategoryAnalysis;
}

export async function translateStory(
  story: {
    title: string;
    summary: string;
    moral: string | null;
    fullContent: string;
  },
  targetLanguage: "en" | "fr"
): Promise<TranslatedStory> {
  const langName = targetLanguage === "en" ? "English" : "French";
  
  const prompt = `Translate the following bedtime story to ${langName}. Maintain the storytelling style, tone, and emotional impact. Keep the summary under 70 words.

Story Title: ${story.title}
Summary: ${story.summary}
Moral: ${story.moral || "None"}
Full Content:
${story.fullContent}

Respond in JSON format:
{
  "title": "Translated title",
  "summary": "Translated summary (max 70 words)",
  "moral": "Translated moral or empty string if none",
  "fullContent": "Translated full story content"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as TranslatedStory;
}

export async function generateStoryFromTitle(
  title: string,
  author: string,
  language: "en" | "fr"
): Promise<GeneratedStory> {
  const langName = language === "en" ? "English" : "French";
  
  const prompt = `You are a master storyteller recreating a classical bedtime story. Based on the title and author, create an authentic, engaging retelling suitable for children.

Title: ${title}
Author: ${author}
Language: ${langName}

Create a complete bedtime story with:
1. An engaging summary (max 70 words or 390 characters)
2. The full story content (appropriate length for bedtime reading, 500-800 words)
3. A moral lesson if appropriate
4. Categorize by age group based on:
   - 0-2 years: Pure fantasy, magic, simple wonder
   - 3-5 years: Fantasy mixed with simple moral lessons
   - 6-10 years: Realistic themes with strong moral lessons

Respond in JSON format:
{
  "title": "Story title in ${langName}",
  "summary": "Engaging summary (max 70 words)",
  "moral": "Moral lesson or empty string",
  "fullContent": "Complete story text",
  "ageRange": "0-2 years" | "3-5 years" | "6-10 years"
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

  return JSON.parse(content) as GeneratedStory;
}

export async function batchCategorizeStories(
  stories: Array<{
    id: string;
    title: string;
    summary: string;
    moral: string | null;
    fullContent: string;
  }>
): Promise<Map<string, CategoryAnalysis>> {
  const results = new Map<string, CategoryAnalysis>();
  
  for (const story of stories) {
    try {
      const analysis = await categorizeStory(
        story.title,
        story.summary,
        story.moral,
        story.fullContent
      );
      results.set(story.id, analysis);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to categorize story ${story.id}:`, error);
    }
  }
  
  return results;
}
