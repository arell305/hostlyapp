import React from "react";
import { ActiveTab } from "../../../../../utils/enum";
import { Tab } from "@/types/types";

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`pb-2 flex-1 text-center ${isActive ? "active" : ""} tab`}
  >
    {label}
  </button>
);

interface TabsNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const tabs: Tab[] = [
  { label: "View", value: ActiveTab.VIEW },
  { label: "Guest List", value: ActiveTab.GUEST_LIST },
  { label: "Ticket Info", value: ActiveTab.TICKET_INFO },
];

const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="relative w-full mb-4 mt-4">
      <div className="flex justify-between w-full">
        {tabs.map((tab) => (
          <Tab
            key={tab.value} // Use a unique key for each tab
            label={tab.label}
            isActive={activeTab === tab.value}
            onClick={() => onTabChange(tab.value)}
          />
        ))}
      </div>
      {/* Underline element */}
      <div
        className={`absolute rounded bottom-0 left-0 h-1 bg-customDarkBlue transition-all duration-300 ease-in-out`}
        style={{
          width: "33.33%", // Assuming three tabs, adjust accordingly
          transform:
            activeTab === ActiveTab.VIEW
              ? "translateX(0)"
              : activeTab === ActiveTab.GUEST_LIST
                ? "translateX(100%)"
                : "translateX(200%)",
        }}
      />
    </div>
  );
};

export default TabsNav;
