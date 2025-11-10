import { generateInfantStories, generateOlderStories } from "./generateAgeSpecificStories";

async function test() {
  console.log("Testing improved validation with smaller batch...\n");
  
  // Test 3 infant stories
  await generateInfantStories(3);
  
  console.log("\n");
  
  // Test 3 older stories  
  await generateOlderStories(3);
}

test();
