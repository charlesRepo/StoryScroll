// Curated title banks for age-specific story generation

export interface StoryTheme {
  title: string;
  theme: string;
  language: "en" | "fr";
}

// 0-2 years: Ultra-simple sensory stories with NO moral lessons
// Focus: Bedtime imagery, gentle creatures, sensory experiences, soothing repetition
export const infant_titles_en: StoryTheme[] = [
  { title: "The Sleepy Moon", theme: "A gentle moon getting ready for bed, yawning and stretching", language: "en" },
  { title: "A Soft Cloud's Journey", theme: "A fluffy cloud floating peacefully across the sky", language: "en" },
  { title: "The Friendly Star", theme: "A twinkling star that says goodnight to everyone", language: "en" },
  { title: "The Gentle Raindrop", theme: "A raindrop's soft journey from sky to earth", language: "en" },
  { title: "The Cozy Blanket", theme: "A warm blanket that hugs and comforts", language: "en" },
  { title: "The Twinkling Firefly", theme: "A firefly dancing with its light in the evening", language: "en" },
  { title: "The Warm Sunbeam", theme: "A sunbeam playing and warming everything it touches", language: "en" },
  { title: "The Dancing Butterfly", theme: "A colorful butterfly floating from flower to flower", language: "en" },
  { title: "The Quiet Snowflake", theme: "A unique snowflake falling gently to the ground", language: "en" },
  { title: "The Happy Teddy Bear", theme: "A soft teddy bear ready for cuddles and dreams", language: "en" },
  { title: "The Singing Bird", theme: "A little bird singing its evening lullaby", language: "en" },
  { title: "The Smiling Flower", theme: "A flower opening and closing with the sun", language: "en" },
  { title: "The Rolling Ball", theme: "A colorful ball bouncing and rolling playfully", language: "en" },
  { title: "The Splashing Duck", theme: "A duck swimming and splashing in a pond", language: "en" },
  { title: "The Cuddly Bunny", theme: "A soft bunny hopping to its cozy burrow", language: "en" },
];

export const infant_titles_fr: StoryTheme[] = [
  { title: "La Lune Endormie", theme: "Une douce lune qui se prépare pour dormir, bâille et s'étire", language: "fr" },
  { title: "Le Voyage d'un Nuage Doux", theme: "Un nuage moelleux qui flotte paisiblement dans le ciel", language: "fr" },
  { title: "L'Étoile Amicale", theme: "Une étoile scintillante qui dit bonne nuit à tout le monde", language: "fr" },
  { title: "La Goutte de Pluie Douce", theme: "Le voyage doux d'une goutte de pluie du ciel à la terre", language: "fr" },
  { title: "La Couverture Confortable", theme: "Une couverture chaude qui câline et réconforte", language: "fr" },
  { title: "La Luciole Scintillante", theme: "Une luciole qui danse avec sa lumière dans la soirée", language: "fr" },
  { title: "Le Rayon de Soleil Chaud", theme: "Un rayon de soleil qui joue et réchauffe tout ce qu'il touche", language: "fr" },
  { title: "Le Papillon Dansant", theme: "Un papillon coloré qui flotte de fleur en fleur", language: "fr" },
  { title: "Le Flocon de Neige Silencieux", theme: "Un flocon de neige unique qui tombe doucement au sol", language: "fr" },
  { title: "L'Ourson Heureux", theme: "Un ourson en peluche doux prêt pour les câlins et les rêves", language: "fr" },
  { title: "L'Oiseau Chanteur", theme: "Un petit oiseau qui chante sa berceuse du soir", language: "fr" },
  { title: "La Fleur Souriante", theme: "Une fleur qui s'ouvre et se ferme avec le soleil", language: "fr" },
  { title: "La Balle Roulante", theme: "Une balle colorée qui rebondit et roule joyeusement", language: "fr" },
  { title: "Le Canard Éclaboussant", theme: "Un canard qui nage et éclabousse dans un étang", language: "fr" },
  { title: "Le Lapin Câlin", theme: "Un lapin doux qui sautille vers son terrier confortable", language: "fr" },
];

// 6-10 years: Realistic stories with strong moral lessons
// Focus: School, friendship, responsibility, consequences, honesty, kindness
export const older_titles_en: StoryTheme[] = [
  { title: "The Lost Library Book", theme: "A child loses a library book and must decide whether to tell the truth", language: "en" },
  { title: "The Broken Promise", theme: "Learning about the importance of keeping your word to friends", language: "en" },
  { title: "The New Student", theme: "Welcoming someone new and overcoming differences", language: "en" },
  { title: "The Team Captain's Choice", theme: "Making fair decisions even when it's hard", language: "en" },
  { title: "The Borrowed Bike", theme: "Taking care of others' belongings and being responsible", language: "en" },
  { title: "The School Project", theme: "Working together and doing your fair share", language: "en" },
  { title: "The Secret Club", theme: "Understanding inclusion and how excluding others feels", language: "en" },
  { title: "The Playground Bully", theme: "Standing up for what's right and helping others", language: "en" },
  { title: "The Big Lie", theme: "Facing the consequences of dishonesty", language: "en" },
  { title: "The Pet Responsibility", theme: "Learning that pets need daily care and commitment", language: "en" },
  { title: "The Share or Keep Decision", theme: "Choosing between selfishness and generosity", language: "en" },
  { title: "The Lost Wallet", theme: "Finding money and deciding to do the right thing", language: "en" },
  { title: "The Messy Room", theme: "Learning to take pride in your space and help at home", language: "en" },
  { title: "The Homework Shortcut", theme: "Understanding why cheating hurts yourself most", language: "en" },
  { title: "The Birthday Invitation", theme: "Including everyone and thinking of others' feelings", language: "en" },
];

export const older_titles_fr: StoryTheme[] = [
  { title: "Le Livre de Bibliothèque Perdu", theme: "Un enfant perd un livre de bibliothèque et doit décider de dire la vérité", language: "fr" },
  { title: "La Promesse Brisée", theme: "Apprendre l'importance de tenir sa parole envers les amis", language: "fr" },
  { title: "Le Nouvel Élève", theme: "Accueillir quelqu'un de nouveau et surmonter les différences", language: "fr" },
  { title: "Le Choix du Capitaine", theme: "Prendre des décisions justes même quand c'est difficile", language: "fr" },
  { title: "Le Vélo Emprunté", theme: "Prendre soin des affaires des autres et être responsable", language: "fr" },
  { title: "Le Projet Scolaire", theme: "Travailler ensemble et faire sa juste part", language: "fr" },
  { title: "Le Club Secret", theme: "Comprendre l'inclusion et ce que ressentent ceux qu'on exclut", language: "fr" },
  { title: "Le Tyran de la Cour", theme: "Défendre ce qui est juste et aider les autres", language: "fr" },
  { title: "Le Grand Mensonge", theme: "Faire face aux conséquences de la malhonnêteté", language: "fr" },
  { title: "La Responsabilité d'un Animal", theme: "Apprendre que les animaux ont besoin de soins quotidiens", language: "fr" },
  { title: "Partager ou Garder", theme: "Choisir entre l'égoïsme et la générosité", language: "fr" },
  { title: "Le Portefeuille Perdu", theme: "Trouver de l'argent et décider de faire ce qui est juste", language: "fr" },
  { title: "La Chambre en Désordre", theme: "Apprendre à être fier de son espace et aider à la maison", language: "fr" },
  { title: "Le Raccourci des Devoirs", theme: "Comprendre pourquoi tricher se fait du tort à soi-même", language: "fr" },
  { title: "L'Invitation d'Anniversaire", theme: "Inclure tout le monde et penser aux sentiments des autres", language: "fr" },
];
