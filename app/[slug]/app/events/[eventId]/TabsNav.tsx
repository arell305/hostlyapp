import React from "react";
import { Tab } from "@/types/types";
import { ActiveStripeTab, ActiveTab } from "@/types/enums";

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const EventTab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`pb-2 flex-1 text-center hover:font-semibold ${isActive ? "active" : ""} tab`}
  >
    {label}
  </button>
);

interface TabsNavProps {
  activeTab: ActiveTab | ActiveStripeTab;
  onTabChange: (tab: ActiveTab | ActiveStripeTab) => void;
  tabs: Tab[];
}

const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onTabChange, tabs }) => {
  const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
  const tabWidth = 100 / tabs.length;

  return (
    <div className="relative w-full mt-4 border-b">
      <div className="flex justify-between w-full">
        {tabs.map((tab) => (
          <EventTab
            key={tab.value}
            label={tab.label}
            isActive={activeTab === tab.value}
            onClick={() => onTabChange(tab.value)}
          />
        ))}
      </div>

      <div
        className="absolute rounded bottom-0 left-0 h-1 bg-customDarkBlue transition-all duration-300 ease-in-out"
        style={{
          width: `${tabWidth}%`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
    </div>
  );
};

export default TabsNav;
