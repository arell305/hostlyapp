"use client";
import { useOrganization } from "@clerk/nextjs";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import Link from "next/link";

const SidebarMenu: React.FC = () => {
  const { organization, isLoaded } = useOrganization();

  // Render loading state if organization is not loaded yet
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Check if user belongs to the "Admin" organization
  const isAppAdmin = organization?.name === "Admin";

  return (
    <Sidebar style={{ height: "100vh" }}>
      <Menu className="md:mt-16">
        {/* Render admin-specific menu item if the user is in the Admin organization */}
        {isAppAdmin && (
          <MenuItem>
            <Link href="/admin">Promotional Companies</Link>
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
