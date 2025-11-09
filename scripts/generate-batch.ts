import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BATCH_SIZE = 10; // Process 10 stories at a time

// Import the story titles from the main script
const storyTitles = {
  en: [
    "Snow White", "Hansel and Gretel", "Rapunzel", "Rumpelstiltskin", "The Frog Prince",
    "Snow-White and Rose-Red", "The Wolf and the Seven Young Kids", "The Golden Goose",
    "Tom Thumb", "The Fisherman and His Wife", "The Valiant Little Tailor",
    "The Bremen Town Musicians", "The Golden Bird", "The Twelve Brothers", "The White Snake",
    "The Elves and the Shoemaker", "Mother Holle", "The Four Skillful Brothers",
    "One-Eye, Two-Eyes, and Three-Eyes", "The Blue Light", "The Little Mermaid",
    "The Ugly Duckling", "The Snow Queen", "The Emperor's New Clothes", "Thumbelina",
    "The Brave Tin Soldier", "The Nightingale", "The Little Match Girl",
    "The Princess and the Pea", "The Tinderbox", "The Red Shoes", "The Wild Swans",
    "The Swineherd", "The Fir Tree", "The Flying Trunk", "The Tortoise and the Hare",
    "The Boy Who Cried Wolf", "The Ant and the Grasshopper", "The Fox and the Grapes",
    "The Lion and the Mouse", "The Town Mouse and the Country Mouse", "The Fox and the Crow",
    "The Goose That Laid the Golden Eggs", "The North Wind and the Sun",
    "The Dog and His Reflection", "The Fox and the Stork", "The Crow and the Pitcher",
    "The Wolf in Sheep's Clothing", "The Bundle of Sticks", "The Three Little Pigs",
    "Goldilocks and the Three Bears", "Jack and the Beanstalk", "The Gingerbread Man",
    "Puss in Boots", "Little Red Riding Hood", "Cinderella", "Sleeping Beauty",
    "Beauty and the Beast", "Aladdin and the Magic Lamp"
  ],
  fr: [
    "Le Petit Chaperon rouge", "Cendrillon", "La Belle au bois dormant", "Le Chat Botté",
    "Les Fées", "Le Petit Poucet", "Barbe-Bleue", "Riquet à la Houpe",
    "La Belle et la Bête", "Blanche-Neige", "Hansel et Gretel", "Raiponce",
    "Le Roi Grenouille", "Rumplestiltskin", "Les Musiciens de Brême",
    "Le Vaillant Petit Tailleur", "Le Loup et les Sept Chevreaux", "L'Oie d'Or",
    "Le Pêcheur et sa Femme", "La Petite Sirène", "Le Vilain Petit Canard",
    "La Reine des Neiges", "Les Habits Neufs de l'Empereur", "Poucette",
    "Le Soldat de Plomb", "Le Rossignol", "La Petite Fille aux Allumettes",
    "La Princesse au Petit Pois", "Le Briquet", "Le Corbeau et le Renard",
    "La Cigale et la Fourmi", "Le Lièvre et la Tortue", "Le Lion et le Rat",
    "La Poule aux Oeufs d'Or", "Le Renard et la Cigogne", "Le Loup et l'Agneau",
    "La Grenouille qui Veut se Faire Aussi Grosse que le Boeuf", "Le Renard et les Raisins",
    "Les Deux Coqs", "Le Chat, la Belette et le Petit Lapin", "Le Loup et le Chien",
    "Le Rat de Ville et le Rat des Champs", "L'Âne et le Petit Chien",
    "Le Coq et la Perle", "La Laitière et le Pot au Lait", "Le Chêne et le Roseau",
    "Le Renard et le Bouc", "La Montagne qui Accouche", "Les Frelons et les Mouches à Miel",
    "Le Lion Devenu Vieux", "Le Renard et le Corbeau", "Les Animaux Malades de la Peste",
    "Le Savetier et le Financier", "La Mort et le Bûcheron", "Le Laboureur et ses Enfants",
    "La Colombe et la Fourmi", "Le Cheval et l'Âne", "Le Meunier, son Fils et l'Âne",
    "Les Deux Amis"
  ]
};

async function generateStory(title: string, lang: 'en' | 'fr'): Promise<any> {
  const languageNames = { en: 'English', fr: 'French' };
  
  const prompt = `Create a bedtime story for children based on the classical tale "${title}" in ${languageNames[lang]}.

Requirements:
1. Full story: 200-400 words, age-appropriate, calming for bedtime
2. Summary: MAX 70 words or 390 characters (including spaces)
3. Moral: 1-2 sentences  
4. Age range: "0-2 years", "3-5 years", or "6-10 years"
5. Original author (Brothers Grimm, Andersen, Aesop, Perrault, etc.)

Return JSON:
{
  "title": "Title in ${languageNames[lang]}",
  "fullContent": "Story (200-400 words)",
  "summary": "Summary (max 70 words/390 chars)",
  "moral": "Moral lesson",
  "ageRange": "3-5 years",
  "authorName": "Author name"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a children's storyteller. Always respond with valid JSON." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  return JSON.parse(completion.choices[0].message.content!);
}

async function translateStory(story: any, targetLang: 'en' | 'fr'): Promise<any> {
  const languageNames = { en: 'English', fr: 'French' };
  
  const prompt = `Translate this bedtime story to ${languageNames[targetLang]}:

Title: ${story.title}
Summary: ${story.summary}
Moral: ${story.moral}
Full Content: ${story.fullContent}

Translate ALL fields. Keep summary under 70 words/390 characters.

Return JSON:
{
  "title": "Translated title",
  "summary": "Translated summary (max 70 words/390 chars)",
  "moral": "Translated moral",
  "fullContent": "Translated story"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are an expert translator. Always respond with valid JSON." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  return JSON.parse(completion.choices[0].message.content!);
}

async function main() {
  console.log('🚀 Starting batch story generation\n');
  
  const outputPath = path.join(__dirname, '../server/generated-stories-temp.json');
  let allStories: any[] = [];
  
  // Load existing progress if any
  if (fs.existsSync(outputPath)) {
    allStories = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    console.log(`📂 Loaded ${allStories.length} existing stories\n`);
  }
  
  const languages: ('en' | 'fr')[] = ['en', 'fr'];
  const originals: Record<string, any> = {};
  
  // Generate originals
  for (const lang of languages) {
    const titles = storyTitles[lang];
    console.log(`\n=== Generating ${titles.length} ${lang.toUpperCase()} originals ===\n`);
    
    for (let i = 0; i < titles.length; i++) {
      const title = titles[i];
      
      // Skip if already generated
      const exists = allStories.find(s => s.title === title && s.language === lang && !s.isTranslated);
      if (exists) {
        console.log(`[${i+1}/${titles.length}] ⏭️  Skipping "${title}" (already exists)`);
        originals[`${lang}:${title}`] = exists;
        continue;
      }
      
      console.log(`[${i+1}/${titles.length}] 📝 Generating "${title}"...`);
      
      try {
        const story = await generateStory(title, lang);
        const fullStory = {
          ...story,
          language: lang,
          isTranslated: false,
          originalLanguage: lang,
          sourceType: 'curated',
          likeCount: 0,
          isPublic: true,
          imageUrl: `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=800`,
        };
        
        allStories.push(fullStory);
        originals[`${lang}:${title}`] = fullStory;
        
        console.log(`  ✅ ${story.ageRange}, ${story.summary.length} chars\n`);
        
        // Save progress every story
        fs.writeFileSync(outputPath, JSON.stringify(allStories, null, 2));
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
      } catch (error: any) {
        console.error(`  ❌ Error: ${error.message}\n`);
      }
    }
  }
  
  console.log('\n=== Starting translations ===\n');
  
  // Translate stories
  for (const lang of languages) {
    const titles = storyTitles[lang];
    
    for (let i = 0; i < titles.length; i++) {
      const title = titles[i];
      const originalStory = originals[`${lang}:${title}`];
      
      if (!originalStory) {
        console.log(`⚠️  Missing original for ${lang}:${title}`);
        continue;
      }
      
      const targetLang = lang === 'en' ? 'fr' : 'en';
      
      // Skip if already translated
      const exists = allStories.find(s => 
        s.originalLanguage === lang && 
        s.language === targetLang && 
        s.isTranslated &&
        originals[`${lang}:${title}`]?.title === s.title
      );
      
      if (exists) {
        console.log(`[${i+1}/${titles.length}] ⏭️  Skipping translation ${lang}→${targetLang} "${title}"`);
        continue;
      }
      
      console.log(`[${i+1}/${titles.length}] 🌐 Translating "${title}" ${lang}→${targetLang}...`);
      
      try {
        const translated = await translateStory(originalStory, targetLang);
        const fullTranslation = {
          ...originalStory,
          ...translated,
          language: targetLang,
          isTranslated: true,
        };
        
        allStories.push(fullTranslation);
        console.log(`  ✅ Translated\n`);
        
        // Save progress
        fs.writeFileSync(outputPath, JSON.stringify(allStories, null, 2));
        
        await new Promise(resolve => setTimeout(resolve, 300)); // Rate limit
      } catch (error: any) {
        console.error(`  ❌ Error: ${error.message}\n`);
      }
    }
  }
  
  console.log('\n✨ Generation complete!');
  console.log(`📊 Total stories: ${allStories.length} (expected: 240)`);
  
  // Final save
  const finalPath = path.join(__dirname, '../server/generated-stories.json');
  fs.writeFileSync(finalPath, JSON.stringify(allStories, null, 2));
  console.log(`💾 Saved to: ${finalPath}`);
  
  // Generate TypeScript file
  const tsContent = `export const classicalStories = ${JSON.stringify(allStories, null, 2)};`;
  const tsPath = path.join(__dirname, '../server/classical-stories.ts');
  fs.writeFileSync(tsPath, tsContent);
  console.log(`💾 Saved to: ${tsPath}`);
}

main().catch(console.error);
