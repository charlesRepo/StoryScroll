import { useState } from "react";
import BottomNav from "../BottomNav";

export default function BottomNavExample() {
  const [activeTab, setActiveTab] = useState<"feed" | "create" | "search" | "liked" | "profile">("feed");

  return (
    <BottomNav
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        console.log("Tab changed:", tab);
      }}
    />
  );
}
