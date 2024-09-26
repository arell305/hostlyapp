"use client";
import { useOrganization } from "@clerk/nextjs";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import Link from "next/link";

const SidebarMenu: React.FC = () => {
  const { organization } = useOrganization();

  return (
    <Sidebar style={{ height: "100vh" }}>
      <Menu>
        <MenuItem>Documentation</MenuItem>
        <MenuItem>Calendar</MenuItem>
        <MenuItem>
          <Link href="/organization">{organization?.name}</Link>
        </MenuItem>
      </Menu>
    </Sidebar>
  );
};

export default SidebarMenu;
