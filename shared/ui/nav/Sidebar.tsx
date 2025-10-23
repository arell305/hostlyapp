import SidebarContent from "./SidebarContent";

const Sidebar = () => {
  return (
    <aside className="hidden lg:block w-64 bg-gray-900 text-white h-screen fixed top-0 left-0 z-50 overflow-y-auto">
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;
