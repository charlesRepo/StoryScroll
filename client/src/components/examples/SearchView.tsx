import SearchView from "../SearchView";
import threePigsImage from "@assets/generated_images/Three_Little_Pigs_Story_8b547c50.png";
import goodnightMoonImage from "@assets/generated_images/Goodnight_Moon_Story_6d2c34bc.png";
import forestImage from "@assets/generated_images/Forest_Adventure_Story_b89c2136.png";

export default function SearchViewExample() {
  const mockStories = [
    {
      id: "1",
      title: "The Three Little Pigs",
      summary: "Three little pigs build houses of different materials.",
      fullContent: "Once upon a time...",
      imageUrl: threePigsImage,
      ageRange: "3-5 years",
      language: "English",
      sourceType: "classic" as const,
      likeCount: 142,
    },
    {
      id: "2",
      title: "Goodnight Moon",
      summary: "A little bunny says goodnight to everything.",
      fullContent: "In the great green room...",
      imageUrl: goodnightMoonImage,
      ageRange: "0-2 years",
      language: "English",
      sourceType: "classic" as const,
      likeCount: 89,
    },
    {
      id: "3",
      title: "Forest Adventure",
      summary: "A curious rabbit explores the magical forest.",
      fullContent: "One sunny morning...",
      imageUrl: forestImage,
      ageRange: "3-5 years",
      language: "English",
      sourceType: "user-shared" as const,
      authorName: "Emma Wilson",
      likeCount: 56,
    },
  ];

  return (
    <SearchView
      allStories={mockStories}
      onStoryClick={(id) => console.log("Story clicked:", id)}
      onLike={(id) => console.log("Like clicked:", id)}
      likedStories={new Set()}
    />
  );
}
