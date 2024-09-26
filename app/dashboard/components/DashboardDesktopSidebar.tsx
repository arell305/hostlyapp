import SidebarMenu from "./SidebarMenu";

const DashboardDesktopSidebar = () => {
  return (
    <div
      className="relative top-0 left-0 h-full bg-customDarkBlue z-10"
      style={{ width: "250px" }}
    >
      <SidebarMenu />
    </div>
  );
};

export default DashboardDesktopSidebar;
