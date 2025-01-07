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
    <>
      {/* Overlay that closes the sidebar when clicked */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-60 top-0" // Semi-transparent overlay
          onClick={toggleSidebar} // Close sidebar on click
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full  z-50 transition-transform duration-300 transform  ${
          isOpen
            ? "translate-x-0 rounded-tr-2xl rounded-br-2xl"
            : "-translate-x-full"
        }`}
      >
        <SidebarMenu toggleSidebar={toggleSidebar} />
      </div>
    </>
  );
};

export default DashboardMobileSidebar;
