import { frenchClassics } from "./classicalStoryData";
import { processClassicalStory } from "./story-processor";

async function testFrenchStory() {
  console.log("Testing first French story generation...\n");
  
  const meta = frenchClassics[0];
  console.log(`Story: ${meta.title}`);
  console.log(`Author: ${meta.author}`);
  console.log(`Description: ${meta.description.substring(0, 100)}...`);
  
  try {
    console.log("\nProcessing...");
    const result = await processClassicalStory(meta);
    console.log("\n✅ Success!");
    console.log(`Title: ${result.title}`);
    console.log(`Age: ${result.ageRange}`);
    console.log(`Summary length: ${result.summary.length}`);
    console.log(`Content length: ${result.fullContent.length}`);
    console.log(`Moral: ${result.moral}`);
  } catch (error) {
    console.error("\n❌ Error:", error);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
  }
}

testFrenchStory()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
