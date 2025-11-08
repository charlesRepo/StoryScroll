import { useState } from "react";
import ProfileSection from "../ProfileSection";

export default function ProfileSectionExample() {
  const [childAge, setChildAge] = useState("3-5 years");
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  return (
    <ProfileSection
      userName="Sarah Johnson"
      childAge={childAge}
      preferredLanguage={preferredLanguage}
      onChildAgeChange={(age) => {
        setChildAge(age);
        console.log("Child age changed:", age);
      }}
      onLanguageChange={(lang) => {
        setPreferredLanguage(lang);
        console.log("Language changed:", lang);
      }}
      onSignOut={() => console.log("Sign out clicked")}
    />
  );
}
