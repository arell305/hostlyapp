"use client";

import SidebarContent from "./SidebarContent";

const Sidebar = ({ slug, orgRole }: { slug: string; orgRole: string }) => {
  return (
    <aside className="hidden lg:block w-64 bg-gray-900 text-white h-screen fixed top-0 left-0 z-50 overflow-y-auto">
      <SidebarContent slug={slug} orgRole={orgRole} />
    </aside>
  );
};

export default Sidebar;
