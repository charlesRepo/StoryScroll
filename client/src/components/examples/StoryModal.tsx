import { useState } from "react";
import StoryModal from "../StoryModal";
import threePigsImage from "@assets/generated_images/Three_Little_Pigs_Story_8b547c50.png";

export default function StoryModalExample() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="p-4">
        <button onClick={() => setIsOpen(true)}>Open Modal</button>
      </div>
    );
  }

  return (
    <StoryModal
      title="The Three Little Pigs"
      fullContent={`Once upon a time, there were three little pigs who lived with their mother. One day, their mother said, "You are old enough now to go out into the world and build your own houses."

The first little pig was very lazy. He built his house out of straw because it was the easiest thing to do. The second little pig was also a bit lazy. He built his house out of sticks, which was slightly stronger than straw but not by much. The third little pig was hardworking and wise. He built his house out of bricks, which took much longer but was very strong.

One day, a big bad wolf came along and saw the first little pig in his house of straw. "Little pig, little pig, let me come in!" he called. "Not by the hair on my chinny chin chin!" replied the pig. "Then I'll huff, and I'll puff, and I'll blow your house in!" said the wolf. And he did just that, blowing the house down easily.

The first little pig ran to his brother's house made of sticks. But the wolf followed him there. "Little pigs, little pigs, let me come in!" "Not by the hair on our chinny chin chins!" they replied together. "Then I'll huff, and I'll puff, and I'll blow your house in!" And he did, sending the stick house tumbling down.

Both pigs ran as fast as they could to their brother's brick house. The wolf arrived and called out, "Little pigs, little pigs, let me come in!" "Not by the hair on our chinny chin chins!" they all replied. "Then I'll huff, and I'll puff, and I'll blow your house in!"

The wolf huffed and puffed, but he could not blow down the brick house. He tried again and again, but the house stood strong. Finally, exhausted, the wolf gave up and went away, never to bother the three little pigs again.

From that day on, the three little pigs lived happily together in the brick house, and they learned that hard work and planning ahead always pays off in the end.`}
      imageUrl={threePigsImage}
      ageRange="3-5 years"
      language="English"
      sourceType="classic"
      likeCount={142}
      isLiked={false}
      onClose={() => {
        setIsOpen(false);
        console.log("Modal closed");
      }}
      onLike={() => console.log("Like clicked in modal")}
    />
  );
}
