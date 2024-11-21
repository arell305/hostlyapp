import { useOrganization } from "@clerk/nextjs";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import Link from "next/link";
import { useUserRole } from "@/hooks/useUserRole";
import { canCreateEvents } from "../../../utils/helpers";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CiCirclePlus } from "react-icons/ci";
import { IoCalendarClearOutline } from "react-icons/io5";
import { LuUsers } from "react-icons/lu";
import { GrRadialSelected } from "react-icons/gr";

interface SidebarMenuProps {
  toggleSidebar?: () => void; // Add this prop
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleSidebar }) => {
  const { role, isLoading } = useUserRole();
  const pathname = usePathname();
  const { organization, isLoaded } = useOrganization();
  const router = useRouter();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedOrgName, setSelectedOrgName] = useState<string | null>(null);

  const { organizationId } = useParams();

  // Make sure organizationId is a valid string or null
  const cleanOrganizationId =
    typeof organizationId === "string" ? organizationId.split("?")[0] : "";

  // Query for organization only if cleanOrganizationId is available
  const organizationFromDB = useQuery(
    api.organizations.getOrganizationByClerkId,
    {
      clerkOrganizationId: cleanOrganizationId,
    }
  );

  useEffect(() => {
    // Retrieve stored organization data from localStorage if it exists
    const storedOrgId = localStorage.getItem("selectedOrgId");
    const storedOrgName = localStorage.getItem("selectedOrgName");

    // If stored organization is available, set it
    if (storedOrgId && storedOrgName) {
      setSelectedOrgId(storedOrgId);
      setSelectedOrgName(storedOrgName);
    } else if (cleanOrganizationId) {
      setSelectedOrgId(cleanOrganizationId);
      if (organizationFromDB) {
        setSelectedOrgName(organizationFromDB?.name);
        // Store selected organization data in localStorage
        localStorage.setItem("selectedOrgId", cleanOrganizationId);
        localStorage.setItem("selectedOrgName", organizationFromDB?.name ?? "");
      }
    } else {
      // If no valid organizationId or stored value, reset state
      setSelectedOrgId(null);
      setSelectedOrgName(null);
    }
  }, [cleanOrganizationId, organizationFromDB]);

  useEffect(() => {
    if (pathname === "/") {
      localStorage.removeItem("selectedOrgId");
      localStorage.removeItem("selectedOrgName");
    }
  }, [pathname]);

  if (!isLoaded || isLoading) {
    return <div>Loading...</div>;
  }

  const handleAddEvent = () => {
    const targetUrl = "/add-event";
    router.push(targetUrl);
    if (toggleSidebar) {
      toggleSidebar();
    }
  };
  const isAppAdmin = organization?.name === "Admin";
  const canCreateEventsPermission = canCreateEvents(role);

  const handleCalendarClick = () => {
    if (isAppAdmin) {
      const encodedName = encodeURIComponent(selectedOrgName || ""); // Encode the name to handle spaces and special characters
      router.push(`/${selectedOrgId}?name=${encodedName}`);
    } else {
      router.push("/");
    }
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  return (
    <Sidebar style={{ height: "100vh" }}>
      <Menu className="md:mt-16">
        {isAppAdmin ? (
          <>
            <MenuItem component={<Link href="/" />}>
              <div className="flex">
                <LuUsers size={14} className="w-6 h-6 mr-2" />
                <p>Customers</p>
              </div>
            </MenuItem>

            {selectedOrgName && (
              <>
                <MenuItem onClick={handleCalendarClick}>
                  <div className="flex font-bold underline">
                    <IoCalendarClearOutline
                      size={14}
                      className="w-6 h-6 mr-2"
                    />
                    <p> {selectedOrgName}</p>
                  </div>
                </MenuItem>{" "}
              </>
            )}
          </>
        ) : (
          // For non-admin users, render Add Event and Calendar as usual
          <>
            {canCreateEventsPermission && (
              <MenuItem onClick={handleAddEvent} className="pointer">
                <div className="flex">
                  <CiCirclePlus size={14} className="w-6 h-6 mr-2" />
                  <p>Add Event</p>
                </div>
              </MenuItem>
            )}
            <MenuItem onClick={handleCalendarClick}>
              <div className="flex">
                <IoCalendarClearOutline size={14} className="w-6 h-6 mr-2" />
                <p>Calendar</p>
              </div>
            </MenuItem>
          </>
        )}
      </Menu>
    </Sidebar>
  );
};

export default SidebarMenu;
