"use client";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";

const DashboardDesktopSidebar = () => {
  return (
    <div
      className="relative top-0 left-0 h-full bg-customDarkBlue z-10"
      style={{ width: "250px" }}
    >
      <Sidebar style={{ height: "calc(100vh - 58px)" }}>
        {" "}
        {/* Adjust for navbar height */}
        <Menu>
          <SubMenu label="Charts">
            <MenuItem>Pie charts</MenuItem>
            <MenuItem>Line charts</MenuItem>
          </SubMenu>
          <MenuItem>Documentation</MenuItem>
          <MenuItem>Calendar</MenuItem>
        </Menu>
      </Sidebar>
    </div>
  );
};

export default DashboardDesktopSidebar;
