import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Story titles organized by original language
const storyTitles = {
  en: [
    // Grimm Brothers (English translations)
    "Snow White",
    "Hansel and Gretel",
    "Rapunzel",
    "Rumpelstiltskin",
    "The Frog Prince",
    "Snow-White and Rose-Red",
    "The Wolf and the Seven Young Kids",
    "The Golden Goose",
    "Tom Thumb",
    "The Fisherman and His Wife",
    "The Valiant Little Tailor",
    "The Bremen Town Musicians",
    "The Golden Bird",
    "The Twelve Brothers",
    "The White Snake",
    "The Elves and the Shoemaker",
    "Mother Holle",
    "The Four Skillful Brothers",
    "One-Eye, Two-Eyes, and Three-Eyes",
    "The Blue Light",
    // Hans Christian Andersen
    "The Little Mermaid",
    "The Ugly Duckling",
    "The Snow Queen",
    "The Emperor's New Clothes",
    "Thumbelina",
    "The Brave Tin Soldier",
    "The Nightingale",
    "The Little Match Girl",
    "The Princess and the Pea",
    "The Tinderbox",
    "The Red Shoes",
    "The Wild Swans",
    "The Swineherd",
    "The Fir Tree",
    "The Flying Trunk",
    // Aesop's Fables
    "The Tortoise and the Hare",
    "The Boy Who Cried Wolf",
    "The Ant and the Grasshopper",
    "The Fox and the Grapes",
    "The Lion and the Mouse",
    "The Town Mouse and the Country Mouse",
    "The Fox and the Crow",
    "The Goose That Laid the Golden Eggs",
    "The North Wind and the Sun",
    "The Dog and His Reflection",
    "The Fox and the Stork",
    "The Crow and the Pitcher",
    "The Wolf in Sheep's Clothing",
    "The Bundle of Sticks",
    // English Folktales
    "The Three Little Pigs",
    "Goldilocks and the Three Bears",
    "Jack and the Beanstalk",
    "The Gingerbread Man",
    "Puss in Boots",
    "Little Red Riding Hood",
    "Cinderella",
    "Sleeping Beauty",
    "Beauty and the Beast",
    "Aladdin and the Magic Lamp",
  ],
  fr: [
    // Charles Perrault
    "Le Petit Chaperon rouge",
    "Cendrillon",
    "La Belle au bois dormant",
    "Le Chat Botté",
    "Les Fées",
    "Le Petit Poucet",
    "Barbe-Bleue",
    "Riquet à la Houpe",
    // Jeanne-Marie Leprince de Beaumont
    "La Belle et la Bête",
    // French Adaptations of Grimm
    "Blanche-Neige",
    "Hansel et Gretel",
    "Raiponce",
    "Le Roi Grenouille",
    "Rumplestiltskin",
    "Les Musiciens de Brême",
    "Le Vaillant Petit Tailleur",
    "Le Loup et les Sept Chevreaux",
    "L'Oie d'Or",
    "Le Pêcheur et sa Femme",
    // French Adaptations of Andersen
    "La Petite Sirène",
    "Le Vilain Petit Canard",
    "La Reine des Neiges",
    "Les Habits Neufs de l'Empereur",
    "Poucette",
    "Le Soldat de Plomb",
    "Le Rossignol",
    "La Petite Fille aux Allumettes",
    "La Princesse au Petit Pois",
    "Le Briquet",
    // Fables de La Fontaine
    "Le Corbeau et le Renard",
    "La Cigale et la Fourmi",
    "Le Lièvre et la Tortue",
    "Le Lion et le Rat",
    "La Poule aux Oeufs d'Or",
    "Le Renard et la Cigogne",
    "Le Loup et l'Agneau",
    "La Grenouille qui Veut se Faire Aussi Grosse que le Boeuf",
    "Le Renard et les Raisins",
    "Les Deux Coqs",
    "Le Chat, la Belette et le Petit Lapin",
    "Le Loup et le Chien",
    "Le Rat de Ville et le Rat des Champs",
    "L'Âne et le Petit Chien",
    "Le Coq et la Perle",
    "La Laitière et le Pot au Lait",
    "Le Chêne et le Roseau",
    "Le Renard et le Bouc",
    "La Montagne qui Accouche",
    "Les Frelons et les Mouches à Miel",
    "Le Lion Devenu Vieux",
    "Le Renard et le Corbeau",
    "Les Animaux Malades de la Peste",
    "Le Savetier et le Financier",
    "La Mort et le Bûcheron",
    "Le Laboureur et ses Enfants",
    "La Colombe et la Fourmi",
    "Le Cheval et l'Âne",
    "Le Meunier, son Fils et l'Âne",
    "Les Deux Amis",
  ],
};

interface StoryData {
  title: string;
  summary: string;
  moral: string;
  fullContent: string;
  ageRange: '0-2 years' | '3-5 years' | '6-10 years';
  language: 'en' | 'fr';
  isTranslated: boolean;
  originalLanguage: 'en' | 'fr';
  sourceType: 'curated';
  authorName: string;
  likeCount: number;
  isPublic: boolean;
  imageUrl: string;
}

async function generateStoryInOriginalLanguage(
  title: string,
  originalLang: 'en' | 'fr'
): Promise<Omit<StoryData, 'language' | 'isTranslated'>> {
  const languageNames = {
    en: 'English',
    fr: 'French',
  };

  const prompt = `You are a master storyteller creating a bedtime story for children based on the classical tale "${title}".

Write this story in ${languageNames[originalLang]} following these guidelines:

1. **Full Story Content**: Write a complete, engaging bedtime story (200-400 words) suitable for children. Include:
   - A clear beginning, middle, and end
   - Age-appropriate language and themes
   - Calming, suitable for bedtime
   - Stay true to the classical tale while making it child-friendly

2. **Summary**: Create a concise summary (MAXIMUM 70 words or 390 characters including spaces). This should capture the key plot points and main characters.

3. **Moral**: A brief moral lesson appropriate for children (1-2 sentences).

4. **Age Range**: Categorize as one of:
   - "0-2 years" (very simple, short, gentle)
   - "3-5 years" (simple stories, clear morals, happy endings)
   - "6-10 years" (more complex plots, adventure, problem-solving)

5. **Author**: Identify the original author (Brothers Grimm, Hans Christian Andersen, Charles Perrault, Aesop, Traditional, etc.)

Return ONLY valid JSON in this exact format:
{
  "title": "Story title in ${languageNames[originalLang]}",
  "fullContent": "Complete story text (200-400 words)",
  "summary": "Brief summary (max 70 words/390 chars)",
  "moral": "Moral lesson",
  "ageRange": "3-5 years",
  "authorName": "Original Author"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert children's storyteller and translator specializing in classical bedtime stories. Always respond with valid JSON.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const result = JSON.parse(completion.choices[0].message.content!);

  // Generate a themed image URL based on the story
  const imageUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=800&h=600&fit=crop`;

  return {
    title: result.title,
    summary: result.summary,
    moral: result.moral,
    fullContent: result.fullContent,
    ageRange: result.ageRange,
    originalLanguage: originalLang,
    sourceType: 'curated',
    authorName: result.authorName,
    likeCount: 0,
    isPublic: true,
    imageUrl,
  };
}

async function translateStory(
  originalStory: Omit<StoryData, 'language' | 'isTranslated'>,
  targetLang: 'en' | 'fr'
): Promise<StoryData> {
  const languageNames = {
    en: 'English',
    fr: 'French',
  };

  const prompt = `Translate this bedtime story from ${languageNames[originalStory.originalLanguage]} to ${languageNames[targetLang]}.

Original story:
Title: ${originalStory.title}
Summary: ${originalStory.summary}
Moral: ${originalStory.moral}
Full Content: ${originalStory.fullContent}

Translate ALL fields (title, summary, moral, and full content) to ${languageNames[targetLang]}. Maintain:
- The same tone and style
- Age-appropriateness
- Summary length (max 70 words/390 characters)
- Cultural sensitivity

Return ONLY valid JSON:
{
  "title": "Translated title",
  "summary": "Translated summary (max 70 words/390 chars)",
  "moral": "Translated moral",
  "fullContent": "Translated full story"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert translator specializing in children's literature. Always respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const translated = JSON.parse(completion.choices[0].message.content!);

  return {
    ...originalStory,
    title: translated.title,
    summary: translated.summary,
    moral: translated.moral,
    fullContent: translated.fullContent,
    language: targetLang,
    isTranslated: true,
  };
}

async function generateAllStories() {
  console.log('Starting story generation pipeline...\n');
  console.log('Generating 120 original stories (60 English + 60 French)');
  console.log('Then translating each to create 240 total story records\n');
  
  const allStories: StoryData[] = [];
  const languages: ('en' | 'fr')[] = ['en', 'fr'];

  // Generate stories in original languages first
  const originalStories: Record<string, Omit<StoryData, 'language' | 'isTranslated'>> = {};

  for (const lang of languages) {
    const titles = storyTitles[lang];
    console.log(`\n=== Generating ${titles.length} ${lang.toUpperCase()} original stories ===`);

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i];
      console.log(`[${i + 1}/${titles.length}] Generating "${title}" in original language (${lang})...`);

      try {
        const story = await generateStoryInOriginalLanguage(title, lang);
        originalStories[`${lang}:${title}`] = story;

        // Add the original language version
        allStories.push({
          ...story,
          language: lang,
          isTranslated: false,
        });

        console.log(`  ✓ Generated (${story.ageRange}, ${story.summary.length} chars)`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ✗ Error generating "${title}":`, error);
      }
    }
  }

  // Now translate each story to all other languages
  console.log('\n\n=== Starting translation phase ===\n');

  for (const lang of languages) {
    const titles = storyTitles[lang];

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i];
      const originalStory = originalStories[`${lang}:${title}`];

      if (!originalStory) {
        console.error(`Missing original story for ${lang}:${title}`);
        continue;
      }

      // Translate to all other languages
      for (const targetLang of languages) {
        if (targetLang === lang) continue; // Skip original language

        console.log(`[${i + 1}/${titles.length}] Translating "${title}" from ${lang} to ${targetLang}...`);

        try {
          const translated = await translateStory(originalStory, targetLang);
          allStories.push(translated);
          console.log(`  ✓ Translated to ${targetLang}`);

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`  ✗ Error translating "${title}" to ${targetLang}:`, error);
        }
      }
    }
  }

  console.log(`\n\n=== Generation Complete ===`);
  console.log(`Total stories generated: ${allStories.length}`);
  console.log(`Expected: 240 (120 originals × 2 languages)`);

  // Save to file
  const outputPath = path.join(__dirname, '../server/generated-stories.json');
  fs.writeFileSync(outputPath, JSON.stringify(allStories, null, 2));
  console.log(`\nSaved to: ${outputPath}`);

  // Generate TypeScript export
  const tsContent = `export const classicalStories = ${JSON.stringify(allStories, null, 2)};`;
  const tsPath = path.join(__dirname, '../server/classical-stories.ts');
  fs.writeFileSync(tsPath, tsContent);
  console.log(`Saved to: ${tsPath}`);

  return allStories;
}

// Run if called directly
if (require.main === module) {
  generateAllStories().catch(console.error);
}

export { generateAllStories, storyTitles };
