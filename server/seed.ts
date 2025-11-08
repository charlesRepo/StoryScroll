import { db } from "./db";
import { stories } from "@shared/schema";

const sampleStories = [
  {
    title: "The Little Star Who Lost Its Light",
    summary: "A tiny star learns that helping others makes it shine brighter than ever.",
    moral: "Kindness and helping others brings out the best in us.",
    fullContent: `Once upon a time, high up in the night sky, there lived a little star named Stella. She was the smallest star in the whole galaxy, and her light was very dim.

Every night, Stella watched the bigger, brighter stars twinkle magnificently. She felt sad that her light was so small. "I wish I could shine as brightly as the others," she sighed.

One evening, Stella noticed a young bird who had lost its way in the darkness. The bird was scared and couldn't find its nest. Without thinking twice, Stella floated down closer to help guide the little bird home with her gentle glow.

The bird followed Stella's light and found its way back to its family. The mother bird was so grateful! As Stella returned to the sky, something magical happened. Her light grew a little brighter.

The next night, Stella helped a lost firefly, and her light grew even more. Night after night, she helped others find their way, and with each act of kindness, her light shone more brilliantly.

Soon, Stella became one of the brightest stars in the sky! She learned that the most beautiful light doesn't come from being the biggest or the brightest, but from having a warm and helpful heart.

And from that day on, whenever children looked up at the night sky, they could see Stella twinkling brightly, reminding them that kindness makes everyone shine.`,
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    ageRange: "3-5 years",
    language: "en",
    isTranslated: false,
    originalLanguage: "en",
    sourceType: "curated",
    authorName: "Bedtime Stories Team",
    isPublic: true,
    likeCount: 24,
  },
  {
    title: "El Conejito Valiente",
    summary: "Un pequeño conejo supera sus miedos y descubre su valentía interior.",
    moral: "El coraje no es la ausencia de miedo, sino hacer lo correcto a pesar del miedo.",
    fullContent: `Había una vez un conejito llamado Bruno que vivía en un hermoso bosque. Bruno era muy tímido y tenía miedo de muchas cosas: la oscuridad, los ruidos fuertes, y especialmente de alejarse de su madriguera.

Un día, su hermanita pequeña, Luna, se aventuró demasiado lejos del hogar persiguiendo una mariposa. Cuando el sol comenzó a ponerse, Luna no podía encontrar el camino de regreso.

Aunque Bruno tenía mucho miedo, sabía que tenía que ayudar a su hermanita. Tomó una respiración profunda y salió de la madriguera. El bosque parecía grande y oscuro, pero Bruno siguió adelante.

Escuchó ruidos extraños entre los árboles, pero no se detuvo. Pasó por lugares que nunca había explorado antes. "Tengo que ser valiente por Luna," se decía a sí mismo.

Finalmente, después de buscar y buscar, Bruno encontró a Luna durmiendo debajo de un árbol grande. La despertó suavemente y juntos encontraron el camino a casa usando las estrellas que brillaban en el cielo.

Cuando llegaron a la madriguera, su mamá los abrazó fuertemente. "Bruno, fuiste muy valiente," le dijo. Bruno sonrió, sintiendo un nuevo coraje en su corazón.

Esa noche, Bruno se dio cuenta de que ser valiente no significa no tener miedo. Significa hacer lo correcto incluso cuando tienes miedo. Y desde ese día, Bruno el Conejito se sintió un poco más valiente cada día.`,
    imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&q=80",
    ageRange: "6-10 years",
    language: "es",
    isTranslated: false,
    originalLanguage: "es",
    sourceType: "curated",
    authorName: "Bedtime Stories Team",
    isPublic: true,
    likeCount: 18,
  },
  {
    title: "La Petite Goutte de Pluie",
    summary: "Une petite goutte de pluie découvre son importance dans le cycle de la vie.",
    moral: "Même les plus petits ont un rôle important à jouer.",
    fullContent: `Il était une fois une petite goutte de pluie nommée Rosée qui vivait dans un nuage doux et blanc, haut dans le ciel.

Rosée regardait les grandes gouttes autour d'elle et se sentait très petite. "Je suis si minuscule," pensait-elle. "Personne ne remarquera si je tombe ou non."

Un jour, le nuage devint lourd et gris. "Il est temps de tomber sur la Terre," dirent les grandes gouttes. Rosée avait peur, mais elle tomba avec les autres, tournoyant et dansant dans l'air.

Elle atterrit doucement sur une petite fleur dans un jardin. La fleur était triste et ses pétales étaient fanés. "Oh, merci petite goutte," murmura la fleur. "J'avais tellement soif. Tu m'as sauvée!"

Rosée était surprise et heureuse! Elle glissa de la fleur et rejoignit d'autres gouttes dans un petit ruisseau. Ensemble, elles coulèrent vers une rivière, puis vers l'océan.

Dans l'océan, Rosée rencontra des milliers d'autres gouttes. Le soleil brillait chaleureusement, et Rosée sentit qu'elle devenait légère. Elle s'élevait dans le ciel, devenant de la vapeur d'eau, puis retournant dans un nuage.

"Regarde!" dit une vieille goutte sage. "Tu fais partie du grand cycle de l'eau. Chaque goutte, grande ou petite, est importante pour donner la vie aux plantes, aux animaux et aux gens."

Rosée sourit. Elle avait appris qu'être petit ne veut pas dire être sans importance. Chacun a un rôle spécial à jouer dans le monde.`,
    imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&q=80",
    ageRange: "3-5 years",
    language: "fr",
    isTranslated: false,
    originalLanguage: "fr",
    sourceType: "curated",
    authorName: "Bedtime Stories Team",
    isPublic: true,
    likeCount: 15,
  },
  {
    title: "Der Freundliche Bär",
    summary: "Ein großer Bär zeigt, dass wahre Freundschaft keine Größe kennt.",
    moral: "Freundlichkeit und ein gutes Herz sind wichtiger als Größe und Stärke.",
    fullContent: `Es war einmal ein großer, starker Bär namens Bruno, der in einem dichten Wald lebte. Alle Tiere hatten Angst vor ihm wegen seiner Größe.

Bruno war traurig, weil er keine Freunde hatte. "Ich bin groß, aber ich bin nicht böse," dachte er. "Ich wünschte, die anderen Tiere würden das verstehen."

Eines Tages hörte Bruno ein leises Weinen. Ein kleines Eichhörnchen hatte seine Nüsse verloren und konnte sie nicht finden. Bruno wollte helfen, aber als das Eichhörnchen ihn sah, bekam es Angst.

"Bitte hab keine Angst," sagte Bruno sanft. "Ich möchte dir helfen." Mit seiner großen Pfote hob er vorsichtig die Blätter auf und fand alle verlorenen Nüsse des Eichhörnchens.

Das Eichhörnchen war überrascht und dankbar. "Du bist so freundlich!" piepste es. "Ich dachte, du wärst gefährlich, aber du hast ein gutes Herz."

Die Nachricht von Brunos Freundlichkeit verbreitete sich schnell im Wald. Ein Vogel mit gebrochenem Flügel kam zu ihm. Bruno baute dem Vogel ein gemütliches Nest und brachte ihm Beeren, bis der Flügel heilte.

Bald kamen mehr Tiere zu Bruno. Sie merkten, dass seine Größe perfekt war, um ihnen zu helfen: Er konnte hohe Früchte pflücken, schwere Äste bewegen und die Kleinen beschützen.

Der Wald wurde zu einem fröhlichen Ort. Bruno hatte viele Freunde gefunden, und sie alle liebten ihn für sein freundliches Herz, nicht trotz seiner Größe, sondern weil er sie nutzte, um anderen zu helfen.

Und so lernte Bruno, dass wahre Freundschaft nicht von der Größe abhängt, sondern von der Größe des Herzens.`,
    imageUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&q=80",
    ageRange: "6-10 years",
    language: "de",
    isTranslated: false,
    originalLanguage: "de",
    sourceType: "curated",
    authorName: "Bedtime Stories Team",
    isPublic: true,
    likeCount: 21,
  },
  {
    title: "Goodnight Moon and Stars",
    summary: "A gentle bedtime journey saying goodnight to everything in the sky and on Earth.",
    moral: "Taking time to appreciate the world around us brings peace and gratitude.",
    fullContent: `In the great big sky, the sun began to set, painting the clouds in pink and orange. Little owl opened her eyes and looked around.

"Goodnight, sun," said little owl. "Thank you for warming the day."

The moon began to rise, big and round and bright.

"Hello, moon," said little owl. "Your light is gentle and kind."

One by one, the stars appeared in the sky, twinkling like tiny diamonds.

"Goodnight, stars," whispered little owl. "You make the night so beautiful."

Below, in the quiet forest, the flowers closed their petals.

"Goodnight, flowers," said little owl. "Sleep well until morning."

The trees swayed gently in the evening breeze.

"Goodnight, trees," hooted little owl softly. "Thank you for your shade."

The stream bubbled quietly as it flowed.

"Goodnight, stream," said little owl. "Your song is peaceful."

All the forest animals found their cozy spots. The rabbits snuggled in their burrow. The squirrels curled up in their tree nests. The deer lay down in the soft grass.

"Goodnight, friends," called little owl gently.

Little owl fluffed her feathers and settled on her favorite branch. She looked up at the moon and stars one more time.

"Goodnight, world," she whispered. "I am grateful for this beautiful day."

And with a happy heart, little owl closed her eyes and drifted off to sleep, surrounded by the quiet night.`,
    imageUrl: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&q=80",
    ageRange: "0-2 years",
    language: "en",
    isTranslated: false,
    originalLanguage: "en",
    sourceType: "curated",
    authorName: "Bedtime Stories Team",
    isPublic: true,
    likeCount: 32,
  },
  {
    title: "The Rainbow Fish Learns to Share",
    summary: "A beautiful fish discovers that sharing brings more happiness than keeping everything for yourself.",
    moral: "Sharing with others brings joy and friendship.",
    fullContent: `Deep in the sparkling ocean lived a beautiful fish with scales that shimmered in all the colors of the rainbow. The other fish called him Rainbow Fish, and he was very proud of his beautiful scales.

Rainbow Fish would swim past the other fish, showing off his shiny scales. "Look at me!" he would say. "I am the most beautiful fish in the ocean!"

The other fish admired Rainbow Fish's scales, but they didn't like how he bragged. One by one, they stopped playing with him. Rainbow Fish found himself swimming alone.

One day, a tiny blue fish swam up to Rainbow Fish. "Your scales are so beautiful," said the little fish. "Would you give me just one? Then I could be beautiful too."

"Give you one of MY scales?" said Rainbow Fish. "No way! These are mine!" The little fish swam away sadly.

Rainbow Fish felt lonely. He swam to visit the wise octopus who lived in a cave. "Why am I so lonely?" he asked.

The octopus smiled gently. "You have beautiful scales, but beauty means nothing if you keep it all to yourself. Try sharing, and you'll discover something wonderful."

Rainbow Fish thought about this. The next day, when the little blue fish came by, Rainbow Fish carefully pulled out one of his shiny scales. "Here," he said. "This is for you."

The little fish's face lit up with joy! "Thank you!" she said, and she swam happily away to show her friends.

Rainbow Fish felt something surprising - happiness! He started giving his scales to other fish. Each time he shared, his heart felt warmer and fuller.

Soon, all the fish in the ocean had a shiny rainbow scale. Rainbow Fish still had enough left to be beautiful, but now he had something better - friends who loved him not for his scales, but for his kindness.

And Rainbow Fish learned that sharing makes everyone happier, including yourself.`,
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    ageRange: "3-5 years",
    language: "en",
    isTranslated: false,
    originalLanguage: "en",
    sourceType: "curated",
    authorName: "Bedtime Stories Team",
    isPublic: true,
    likeCount: 45,
  },
];

async function seedDatabase() {
  try {
    console.log("Seeding database with sample stories...");
    
    for (const story of sampleStories) {
      await db.insert(stories).values(story);
      console.log(`Added story: ${story.title}`);
    }
    
    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
