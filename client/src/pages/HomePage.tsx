import { useState, useRef, useEffect } from "react";
import StoryCard from "@/components/StoryCard";
import FilterBar from "@/components/FilterBar";
import BottomNav from "@/components/BottomNav";
import StoryModal from "@/components/StoryModal";
import CreateStoryForm from "@/components/CreateStoryForm";
import LikedStoriesGrid from "@/components/LikedStoriesGrid";
import ProfileSection from "@/components/ProfileSection";
import threePigsImage from "@assets/generated_images/Three_Little_Pigs_Story_8b547c50.png";
import goodnightMoonImage from "@assets/generated_images/Goodnight_Moon_Story_6d2c34bc.png";
import forestImage from "@assets/generated_images/Forest_Adventure_Story_b89c2136.png";
import redRidingHoodImage from "@assets/generated_images/Little_Red_Riding_Hood_07773a5e.png";
import oceanImage from "@assets/generated_images/Ocean_Adventure_Story_00f0d0ea.png";
import teddyBearImage from "@assets/generated_images/Teddy_Bear_Picnic_Story_d96709f1.png";

// todo: remove mock functionality
const MOCK_STORIES = [
  {
    id: "1",
    title: "The Three Little Pigs",
    summary: "Three little pigs each build a house of different materials. A big bad wolf blows down the houses made of straw and sticks, but he cannot blow down the house made of bricks.",
    fullContent: `Once upon a time, there were three little pigs who lived with their mother. One day, their mother said, "You are old enough now to go out into the world and build your own houses."\n\nThe first little pig was very lazy. He built his house out of straw because it was the easiest thing to do. The second little pig was also a bit lazy. He built his house out of sticks, which was slightly stronger than straw but not by much. The third little pig was hardworking and wise. He built his house out of bricks, which took much longer but was very strong.\n\nOne day, a big bad wolf came along and saw the first little pig in his house of straw. "Little pig, little pig, let me come in!" he called. "Not by the hair on my chinny chin chin!" replied the pig. "Then I'll huff, and I'll puff, and I'll blow your house in!" said the wolf. And he did just that, blowing the house down easily.\n\nThe first little pig ran to his brother's house made of sticks. But the wolf followed him there. "Little pigs, little pigs, let me come in!" "Not by the hair on our chinny chin chins!" they replied together. "Then I'll huff, and I'll puff, and I'll blow your house in!" And he did, sending the stick house tumbling down.\n\nBoth pigs ran as fast as they could to their brother's brick house. The wolf arrived and called out, "Little pigs, little pigs, let me come in!" "Not by the hair on our chinny chin chins!" they all replied. "Then I'll huff, and I'll puff, and I'll blow your house in!"\n\nThe wolf huffed and puffed, but he could not blow down the brick house. He tried again and again, but the house stood strong. Finally, exhausted, the wolf gave up and went away, never to bother the three little pigs again.\n\nFrom that day on, the three little pigs lived happily together in the brick house, and they learned that hard work and planning ahead always pays off in the end.`,
    imageUrl: threePigsImage,
    ageRange: "3-5 years",
    language: "English",
    sourceType: "classic" as const,
    likeCount: 142,
  },
  {
    id: "2",
    title: "Goodnight Moon",
    summary: "A little bunny says goodnight to everything in the great green room before drifting off to sleep.",
    fullContent: `In the great green room, there was a telephone, and a red balloon, and a picture of a cow jumping over the moon.\n\nThere were three little bears sitting on chairs, and two little kittens, and a pair of mittens, and a little toy house, and a young mouse.\n\nAnd a comb and a brush, and a bowl full of mush, and a quiet old lady who was whispering "hush."\n\n"Goodnight room," said the little bunny.\n\n"Goodnight moon," said the little bunny. "Goodnight cow jumping over the moon. Goodnight light, and the red balloon. Goodnight bears. Goodnight chairs."\n\n"Goodnight kittens. And goodnight mittens. Goodnight clocks. And goodnight socks."\n\n"Goodnight little house. And goodnight mouse. Goodnight comb. And goodnight brush."\n\n"Goodnight nobody. Goodnight mush. And goodnight to the old lady whispering hush."\n\n"Goodnight stars. Goodnight air. Goodnight noises everywhere."\n\nAnd soon, the little bunny was fast asleep, dreaming sweet dreams in the great green room.`,
    imageUrl: goodnightMoonImage,
    ageRange: "0-2 years",
    language: "English",
    sourceType: "classic" as const,
    likeCount: 89,
  },
  {
    id: "3",
    title: "Forest Adventure",
    summary: "A curious rabbit explores the magical forest and makes new friends along the way.",
    fullContent: `One sunny morning, a little rabbit named Rosie decided to explore the forest beyond her burrow. She hopped along the mossy path, her nose twitching with excitement.\n\nSoon, she met a friendly deer named Daisy. "Where are you going?" asked Daisy. "I'm exploring!" said Rosie. "May I come along?" asked Daisy, and Rosie nodded happily.\n\nAs they walked deeper into the forest, they discovered a sparkling stream. A wise old turtle was sunbathing on a rock. "Hello, little ones," said the turtle. "The forest is full of wonders if you look closely."\n\nThe turtle showed them where butterflies danced in the sunlight and where wild berries grew on bushes. They saw squirrels gathering acorns and heard birds singing in the trees.\n\nAs the sun began to set, Rosie realized it was time to go home. "Thank you for the wonderful adventure," she said to her new friends. "We'll explore together again soon!"\n\nRosie hopped back to her burrow, her heart full of joy from her forest adventure and the new friends she had made.`,
    imageUrl: forestImage,
    ageRange: "3-5 years",
    language: "English",
    sourceType: "user-shared" as const,
    authorName: "Emma Wilson",
    likeCount: 56,
  },
  {
    id: "4",
    title: "Little Red Riding Hood",
    summary: "A young girl in a red hood visits her grandmother through the woods, where she meets a cunning wolf.",
    fullContent: `Once upon a time, there was a sweet little girl who everyone loved. Her grandmother made her a beautiful red hooded cape, and she wore it so often that everyone called her Little Red Riding Hood.\n\nOne day, her mother said, "Your grandmother is not feeling well. Please take this basket of goodies to her." Little Red Riding Hood was happy to help and set off through the woods.\n\nAs she walked, she picked flowers for her grandmother. A wolf saw her and asked, "Where are you going, little girl?" "To my grandmother's house," she replied innocently, telling him where her grandmother lived.\n\nThe wolf ran ahead to grandmother's house, knocked on the door, and when grandmother opened it, he quickly hid her in the closet (in this gentle version). He put on her nightgown and cap and got into her bed.\n\nWhen Little Red Riding Hood arrived, she noticed something odd. "Grandmother, what big ears you have!" "All the better to hear you with," said the wolf. "And what big eyes you have!" "All the better to see you with!"\n\n"And what big teeth you have!" "All the better to eat these cookies with!" Just then, a woodsman passing by heard the commotion and came to investigate.\n\nHe recognized the wolf and helped grandmother out of the closet. The wolf ran away, never to bother them again. Little Red Riding Hood learned to be more careful and never talk to strangers in the woods.`,
    imageUrl: redRidingHoodImage,
    ageRange: "6-10 years",
    language: "English",
    isTranslated: true,
    originalLanguage: "French",
    sourceType: "classic" as const,
    likeCount: 127,
  },
  {
    id: "5",
    title: "Ocean Discovery",
    summary: "Join Tommy the turtle on an underwater adventure as he explores the colorful coral reef and meets amazing sea creatures.",
    fullContent: `Tommy the turtle lived in a beautiful coral reef full of colors. One morning, he decided to explore a part of the ocean he had never seen before.\n\nAs he swam deeper, he met Sally the seahorse. "Would you like to see something magical?" she asked. Tommy nodded excitedly, and Sally led him to a field of swaying sea grass where baby fish played hide and seek.\n\nNext, they met Oscar the octopus, who showed them how he could change colors to match the rocks and coral around him. "That's amazing!" said Tommy.\n\nThey swam past schools of bright tropical fish that sparkled like rainbows in the sunlight that filtered through the water. A gentle manta ray glided gracefully overhead.\n\nAs the day ended, Tommy returned home to tell his family all about his ocean discoveries. He couldn't wait for his next underwater adventure!`,
    imageUrl: oceanImage,
    ageRange: "3-5 years",
    language: "English",
    sourceType: "user-shared" as const,
    authorName: "David Chen",
    likeCount: 73,
  },
  {
    id: "6",
    title: "The Teddy Bears' Picnic",
    summary: "All the teddy bears in the world gather for a special picnic in the woods on a magical summer day.",
    fullContent: `If you go down to the woods today, you're in for a big surprise! All the teddy bears from around the world were gathering for their annual picnic.\n\nThere was Barnaby, a big brown bear with a red bow tie. Beside him sat Honeybee, a golden bear who loved to dance. Tiny Ted was the smallest bear, but he had the biggest heart.\n\nThe bears spread out their checkered blankets and unpacked baskets full of honey sandwiches, berry tarts, and sweet treats. They played games like hide-and-seek among the trees and had races across the meadow.\n\nAs the sun began to set, all the bears gathered in a circle and sang songs together. They danced under the twinkling stars until it was time to say goodbye.\n\n"Same time next year?" asked Barnaby, and all the bears agreed with happy nods. They packed up their baskets and headed home, tired but filled with wonderful memories of their special day together.`,
    imageUrl: teddyBearImage,
    ageRange: "0-2 years",
    language: "English",
    sourceType: "classic" as const,
    likeCount: 95,
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"feed" | "create" | "liked" | "profile">("feed");
  const [selectedAge, setSelectedAge] = useState("3-5 years");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // todo: remove mock functionality
  const handleLike = (storyId: string) => {
    setLikedStories((prev) => {
      const newLikes = new Set(prev);
      if (newLikes.has(storyId)) {
        newLikes.delete(storyId);
      } else {
        newLikes.add(storyId);
      }
      return newLikes;
    });
  };

  // Swipe gesture handling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || activeTab !== "feed") return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      const diff = startY - currentY;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentStoryIndex < MOCK_STORIES.length - 1) {
          setCurrentStoryIndex((prev) => prev + 1);
        } else if (diff < 0 && currentStoryIndex > 0) {
          setCurrentStoryIndex((prev) => prev - 1);
        }
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentStoryIndex, activeTab]);

  // Auto-scroll to current story
  useEffect(() => {
    if (scrollContainerRef.current && activeTab === "feed") {
      const container = scrollContainerRef.current;
      const storyHeight = window.innerHeight;
      container.scrollTo({
        top: currentStoryIndex * storyHeight,
        behavior: "smooth",
      });
    }
  }, [currentStoryIndex, activeTab]);

  const currentStory = selectedStory
    ? MOCK_STORIES.find((s) => s.id === selectedStory)
    : null;

  const likedStoriesList = MOCK_STORIES.filter((story) =>
    likedStories.has(story.id)
  ).map((story) => ({
    id: story.id,
    title: story.title,
    imageUrl: story.imageUrl,
    likeCount: story.likeCount,
  }));

  return (
    <div className="h-screen overflow-hidden bg-background">
      {activeTab === "feed" && <FilterBar
        selectedAge={selectedAge}
        selectedLanguage={selectedLanguage}
        onAgeChange={setSelectedAge}
        onLanguageChange={setSelectedLanguage}
      />}

      <div className="h-full pb-16">
        {activeTab === "feed" && (
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {MOCK_STORIES.map((story) => (
              <StoryCard
                key={story.id}
                {...story}
                isLiked={likedStories.has(story.id)}
                onLike={() => handleLike(story.id)}
                onClick={() => setSelectedStory(story.id)}
              />
            ))}
          </div>
        )}

        {activeTab === "create" && (
          <div className="h-full overflow-y-auto">
            <CreateStoryForm
              onGenerate={(params) => {
                console.log("Generate story:", params);
              }}
            />
          </div>
        )}

        {activeTab === "liked" && (
          <div className="h-full overflow-y-auto">
            <LikedStoriesGrid
              stories={likedStoriesList}
              onStoryClick={(id) => setSelectedStory(id)}
            />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="h-full overflow-y-auto">
            <ProfileSection
              userName="Sarah Johnson"
              childAge={selectedAge}
              preferredLanguage={selectedLanguage}
              onChildAgeChange={setSelectedAge}
              onLanguageChange={setSelectedLanguage}
              onSignOut={() => console.log("Sign out")}
            />
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {currentStory && (
        <StoryModal
          {...currentStory}
          isLiked={likedStories.has(currentStory.id)}
          onClose={() => setSelectedStory(null)}
          onLike={() => handleLike(currentStory.id)}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
