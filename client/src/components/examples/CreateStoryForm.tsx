import { useState } from "react";
import CreateStoryForm from "../CreateStoryForm";

export default function CreateStoryFormExample() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <CreateStoryForm
      onGenerate={(params) => {
        console.log("Generate story:", params);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
      }}
      isLoading={isLoading}
    />
  );
}
