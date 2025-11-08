import { useState } from "react";
import FilterBar from "../FilterBar";

export default function FilterBarExample() {
  const [selectedAge, setSelectedAge] = useState("3-5 years");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  return (
    <FilterBar
      selectedAge={selectedAge}
      selectedLanguage={selectedLanguage}
      onAgeChange={(age) => {
        setSelectedAge(age);
        console.log("Age changed:", age);
      }}
      onLanguageChange={(lang) => {
        setSelectedLanguage(lang);
        console.log("Language changed:", lang);
      }}
    />
  );
}
