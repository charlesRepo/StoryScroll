import StoryCard from "../StoryCard";
import threePigsImage from "@assets/generated_images/Three_Little_Pigs_Story_8b547c50.png";

export default function StoryCardExample() {
  return (
    <StoryCard
      id="1"
      title="The Three Little Pigs"
      summary="Three little pigs each build a house of different materials. The first pig builds his house out of straw because it's quick and easy. The second pig builds his house out of sticks, which is slightly stronger. The third pig works hard to build a sturdy house out of bricks. When a big bad wolf comes along, he easily blows down the houses made of straw and sticks, but no matter how hard he huffs and puffs, he cannot blow down the strong brick house. The three pigs learn an important lesson about hard work and planning ahead."
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
