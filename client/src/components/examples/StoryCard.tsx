import StoryCard from "../StoryCard";
import threePigsImage from "@assets/generated_images/Three_Little_Pigs_Story_8b547c50.png";

export default function StoryCardExample() {
  return (
    <StoryCard
      id="1"
      title="The Three Little Pigs"
      summary="Three little pigs each build a house of different materials. A big bad wolf blows down the houses made of straw and sticks, but he cannot blow down the house made of bricks."
      imageUrl={threePigsImage}
      ageRange="3-5 years"
      language="English"
      sourceType="classic"
      likeCount={142}
      isLiked={false}
      onLike={() => console.log("Like clicked")}
      onClick={() => console.log("Story card clicked")}
    />
  );
}
