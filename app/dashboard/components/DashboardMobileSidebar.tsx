"use client";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";

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
      style={{ width: "250px", marginTop: "58px" }} // Adjust for navbar height
    >
      <Sidebar style={{ height: "100vh" }}>
        <Menu>
          <SubMenu label="Charts">
            <MenuItem>Pie charts</MenuItem>
            <MenuItem>Line charts</MenuItem>
          </SubMenu>
          <MenuItem>Documentation</MenuItem>
          <MenuItem>Calendar</MenuItem>
        </Menu>
      </Sidebar>
      <div className="fixed inset-0 z-10" onClick={toggleSidebar}></div>{" "}
      {/* Overlay to close sidebar */}
    </div>
  );
};

export default DashboardMobileSidebar;
