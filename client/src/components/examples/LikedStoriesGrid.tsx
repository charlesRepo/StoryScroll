import LikedStoriesGrid from "../LikedStoriesGrid";
import threePigsImage from "@assets/generated_images/Three_Little_Pigs_Story_8b547c50.png";
import goodnightMoonImage from "@assets/generated_images/Goodnight_Moon_Story_6d2c34bc.png";
import forestImage from "@assets/generated_images/Forest_Adventure_Story_b89c2136.png";
import oceanImage from "@assets/generated_images/Ocean_Adventure_Story_00f0d0ea.png";

export default function LikedStoriesGridExample() {
  const stories = [
    {
      id: "1",
      title: "The Three Little Pigs",
      imageUrl: threePigsImage,
      likeCount: 142,
    },
    {
      id: "2",
      title: "Goodnight Moon",
      imageUrl: goodnightMoonImage,
      likeCount: 89,
    },
    {
      id: "3",
      title: "Forest Adventure",
      imageUrl: forestImage,
      likeCount: 56,
    },
    {
      id: "4",
      title: "Ocean Discovery",
      imageUrl: oceanImage,
      likeCount: 73,
    },
  ];

  return (
    <LikedStoriesGrid
      stories={stories}
      onStoryClick={(id) => console.log("Story clicked:", id)}
    />
  );
}
