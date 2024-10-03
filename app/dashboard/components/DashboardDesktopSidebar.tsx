import SidebarMenu from "./SidebarMenu";

const DashboardDesktopSidebar = () => {
  return (
    <div className="fixed top-0 left-0 w-[250px] h-screen bg-customDarkBlue z-10 overflow-y-auto">
      <SidebarMenu />
    </div>
  );
};

export default DashboardDesktopSidebar;
