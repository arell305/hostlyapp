import React from "react";
import { ActiveStripeTab, ActiveTab } from "../../../../../utils/enum";
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
  activeTab: ActiveTab | ActiveStripeTab;
  onTabChange: (tab: ActiveTab | ActiveStripeTab) => void;
  tabs: Tab[];
}

// const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onTabChange, tabs }) => {
//   return (
//     <div className="relative w-full mt-4 border-b">
//       <div className="flex justify-between w-full">
//         {tabs.map((tab) => (
//           <Tab
//             key={tab.value} // Use a unique key for each tab
//             label={tab.label}
//             isActive={activeTab === tab.value}
//             onClick={() => onTabChange(tab.value)}
//           />
//         ))}
//       </div>
//       {/* Underline element */}
//       <div
//         className={`absolute rounded bottom-0 left-0 h-1 bg-customDarkBlue transition-all duration-300 ease-in-out`}
//         style={{
//           width: "33.33%", // Assuming three tabs, adjust accordingly
//           transform:
//             activeTab === ActiveTab.VIEW
//               ? "translateX(0)"
//               : activeTab === ActiveTab.GUEST_LIST
//                 ? "translateX(100%)"
//                 : "translateX(200%)",
//         }}
//       />
//     </div>
//   );
// };
const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onTabChange, tabs }) => {
  // Find the index of the active tab
  const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
  const tabWidth = 100 / tabs.length; // Dynamically set width based on number of tabs

  return (
    <div className="relative w-full mt-4 border-b">
      <div className="flex justify-between w-full">
        {tabs.map((tab) => (
          <Tab
            key={tab.value} // Ensure unique key
            label={tab.label}
            isActive={activeTab === tab.value}
            onClick={() => onTabChange(tab.value)}
          />
        ))}
      </div>

      {/* Underline element */}
      <div
        className="absolute rounded bottom-0 left-0 h-1 bg-customDarkBlue transition-all duration-300 ease-in-out"
        style={{
          width: `${tabWidth}%`, // Dynamic width based on tab count
          transform: `translateX(${activeIndex * 100}%)`, // Move to the correct tab
        }}
      />
    </div>
  );
};

export default TabsNav;
