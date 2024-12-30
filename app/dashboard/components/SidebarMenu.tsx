import { useClerk } from "@clerk/nextjs";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CiCirclePlus } from "react-icons/ci";
import { IoCalendarClearOutline } from "react-icons/io5";
import { LuUsers } from "react-icons/lu";
import { FaUserGroup } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { UserRole } from "../../../utils/enum";

interface SidebarMenuProps {
  toggleSidebar?: () => void; // Add this prop
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleSidebar }) => {
  const pathname = usePathname();
  const { user, organization, loaded } = useClerk();
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

  if (!loaded) {
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
  const role = user?.organizationMemberships[0]?.role;
  const canCreateEventsPermission =
    role === UserRole.Admin || role === UserRole.Manager;

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

  const handleTeamClick = () => {
    router.push("/team");
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  const handleTeamSettingsClick = () => {
    router.push("/team-settings");

    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  return (
    <Sidebar
      className="h-screen bg-blue-200 "
      style={{
        width: "320px",
        overflow: "hidden",
      }}
    >
      <div className="mt-3 ml-6 mb-1">
        <a href="/" className="text-2xl font-semibold ">
          {organization?.name ?? "Hostly"}
        </a>
      </div>
      <Menu>
        {isAppAdmin ? (
          <>
            <MenuItem component={<Link href="/" />}>
              <div className="flex">
                <LuUsers size={14} className="w-6 h-6 mr-2" />
                <p>Customers</p>
              </div>
            </MenuItem>
            <MenuItem onClick={handleTeamClick}>
              <div className="flex ">
                <FaUserGroup size={14} className="w-6 h-6 mr-2" />
                <p>Team Members</p>
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
                    <p> {selectedOrgName} Calendar</p>
                  </div>
                </MenuItem>{" "}
              </>
            )}
          </>
        ) : (
          // For non-app-admin users
          <>
            {canCreateEventsPermission && (
              <MenuItem onClick={handleAddEvent} className="pointer ">
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
            <MenuItem onClick={handleTeamClick}>
              <div className="flex">
                <FaUserGroup size={14} className="w-6 h-6 mr-2" />
                <p>Team Members</p>
              </div>
            </MenuItem>
            {canCreateEventsPermission && (
              <MenuItem onClick={handleTeamSettingsClick} className="pointer">
                <div className="flex">
                  <IoSettingsOutline size={14} className="w-6 h-6 mr-2" />
                  <p>Team Settings</p>
                </div>
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </Sidebar>
  );
};

export default SidebarMenu;
