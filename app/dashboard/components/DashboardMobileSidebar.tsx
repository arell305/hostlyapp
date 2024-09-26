"use client";
import SidebarMenu from "./SidebarMenu";

interface DashboardMobileSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const DashboardMobileSidebar: React.FC<DashboardMobileSidebarProps> = ({
  isOpen,
  toggleSidebar,
}) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-customDarkBlue z-20 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ width: "250px", marginTop: "58px" }}
    >
      <SidebarMenu />

      <div className="fixed inset-0 z-10" onClick={toggleSidebar}></div>
    </div>
  );
};

export default DashboardMobileSidebar;
