import { useOrganization } from "@clerk/nextjs";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import Link from "next/link";
import { useUserRole } from "@/hooks/useUserRole";
import { canCreateEvents } from "../../../utils/helpers";
import { Button } from "@/components/ui/button";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const SidebarMenu: React.FC = () => {
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

  console.log("org", organizationFromDB);

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
    const targetUrl = isAppAdmin
      ? `/add-event?organizationId=${cleanOrganizationId}`
      : "/add-event";
    router.push(targetUrl);
  };
  const isAppAdmin = organization?.name === "Admin";
  const canCreateEventsPermission = canCreateEvents(role);

  const handleCompanyClick = () => {
    const encodedName = encodeURIComponent(selectedOrgName || ""); // Encode the name to handle spaces and special characters
    router.push(`/${selectedOrgId}?name=${encodedName}`);
  };

  return (
    <Sidebar style={{ height: "100vh" }}>
      <Menu className="md:mt-16">
        {isAppAdmin ? (
          <>
            <MenuItem>
              <Link href="/">Promotional Companies</Link>
            </MenuItem>

            {selectedOrgName && (
              <>
                <MenuItem>{selectedOrgName}</MenuItem>
                <MenuItem>
                  <Button onClick={handleAddEvent}>Add Event</Button>
                </MenuItem>
                <MenuItem onClick={handleCompanyClick}>Calendar</MenuItem>
              </>
            )}
          </>
        ) : (
          // For non-admin users, render Add Event and Calendar as usual
          <>
            {canCreateEventsPermission && (
              <MenuItem>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </MenuItem>
            )}
            <MenuItem>Calendar</MenuItem>
          </>
        )}

        <MenuItem>
          <Link href="/organization">{organization?.name}</Link>
        </MenuItem>
      </Menu>
    </Sidebar>
  );
};

export default SidebarMenu;
