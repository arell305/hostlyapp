import { useRouter } from "next/navigation";
import SidebarContent from "./SidebarContent";

const Sidebar = ({ slug, orgRole }: { slug: string; orgRole: string }) => {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <aside className="hidden lg:block w-64 bg-gray-900 text-white h-screen fixed top-0 left-0 z-50 overflow-y-auto">
      <SidebarContent
        slug={slug}
        orgRole={orgRole}
        handleNavigate={handleNavigate}
      />
    </aside>
  );
};

export default Sidebar;
