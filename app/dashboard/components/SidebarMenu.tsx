"use client";
import { useOrganization } from "@clerk/nextjs";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import Link from "next/link";
import { useUserRole } from "@/hooks/useUserRole";
import { canCreateEvents } from "../../../utils/helpers";

const SidebarMenu: React.FC = () => {
  const { role, isLoading } = useUserRole();
  const { organization, isLoaded } = useOrganization();

  // Render loading state if organization is not loaded yet
  if (!isLoaded || isLoading) {
    return <div>Loading...</div>;
  }

  // Check if user belongs to the "Admin" organization
  const isAppAdmin = organization?.name === "Admin";
  const canCreateEventsPermission = canCreateEvents(role);

  return (
    <Sidebar style={{ height: "100vh" }}>
      <Menu className="md:mt-16">
        {/* Render admin-specific menu item if the user is in the Admin organization */}
        {isAppAdmin && (
          <MenuItem>
            <Link href="/admin">Promotional Companies</Link>
          </MenuItem>
        )}
        {canCreateEventsPermission && (
          <MenuItem>
            <Link href="/add-event">Add Event</Link>
          </MenuItem>
        )}
        <MenuItem>Calendar</MenuItem>
        <MenuItem>
          <Link href="/organization">{organization?.name}</Link>
        </MenuItem>
      </Menu>
    </Sidebar>
  );
};

export default SidebarMenu;
