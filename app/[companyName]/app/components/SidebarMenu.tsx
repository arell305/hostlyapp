"use client";
import { Protect, useClerk } from "@clerk/nextjs";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { IoBusinessOutline } from "react-icons/io5";
import { RiTeamLine } from "react-icons/ri";
import { IoCalendarClearOutline } from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { CiCirclePlus } from "react-icons/ci";
import { useEffect, useState } from "react";
import { PiNewspaper } from "react-icons/pi";
import { IoHomeOutline } from "react-icons/io5";

interface SidebarMenuProps {
  toggleSidebar?: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleSidebar }) => {
  const { organization, user } = useClerk();
  const router = useRouter();
  const { companyName } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [organization]);

  const cleanCompanyName =
    typeof companyName === "string"
      ? companyName.split("?")[0].toLowerCase()
      : "";

  const isAppAdmin = organization?.name === "admin";
  const handleItemClick = (path: string) => {
    router.push(path);
    if (toggleSidebar) {
      toggleSidebar();
    }
  };
  const [orgName, setOrgName] = useState("Hostly");
  useEffect(() => {
    setOrgName(organization?.name ?? "Hostly");
  }, [organization]);
  if (isLoading) {
    return (
      <Sidebar
        className="h-screen bg-blue-200"
        style={{
          width: "320px",
          overflow: "hidden",
        }}
      ></Sidebar>
    );
  }
  return (
    <Sidebar
      className="h-screen bg-blue-200"
      style={{
        width: "320px",
        overflow: "hidden",
      }}
    >
      <div className="mt-3 ml-6 mb-1">
        <p
          className="text-2xl font-semibold cursor-pointer"
          onClick={() => {
            isAppAdmin
              ? handleItemClick("/admin/app/companies")
              : handleItemClick(`/${companyName}/app/dashboard`);
          }}
        >
          {orgName}
        </p>
      </div>

      <Menu>
        {isAppAdmin && (
          <>
            <MenuItem onClick={() => handleItemClick("/admin/app/companies")}>
              <div className="flex">
                <IoBusinessOutline size={14} className="w-6 h-6 mr-2" />
                <p>Companies</p>
              </div>
            </MenuItem>
            <MenuItem onClick={() => handleItemClick("/admin/app/team")}>
              <div className="flex">
                <RiTeamLine size={14} className="w-6 h-6 mr-2" />
                <p>Hostly Members</p>
              </div>
            </MenuItem>
            <div className="border-b border-gray-300 my-4"></div>
          </>
        )}

        {companyName && cleanCompanyName !== "admin" && (
          <>
            {isAppAdmin && (
              <Link href={`/${companyName}/app/dashboard`}>
                <div className="ml-6 mt-4 mb-2 text-2xl font-semibold">
                  {decodeURIComponent(cleanCompanyName)}
                </div>
              </Link>
            )}
            <MenuItem>
              <Link href={`/${companyName}/app/dashboard`}>
                <div className="flex">
                  <IoHomeOutline size={14} className="w-6 h-6 mr-2" />
                  <p>Home</p>
                </div>
              </Link>
            </MenuItem>

            <Protect
              condition={(has) => has({ permission: "org:events:create" })}
            >
              <MenuItem>
                <Link href={`/${companyName}/app/add-event`}>
                  <div className="flex">
                    <CiCirclePlus size={14} className="w-6 h-6 mr-2" />
                    <p>Add Event</p>
                  </div>
                </Link>
              </MenuItem>
            </Protect>
            <MenuItem onClick={() => handleItemClick(`/${companyName}/app`)}>
              <div className="flex">
                <IoCalendarClearOutline size={14} className="w-6 h-6 mr-2" />
                <p>Customer Calendar</p>
              </div>
            </MenuItem>
            <MenuItem
              onClick={() => handleItemClick(`/${companyName}/app/team`)}
            >
              <div className="flex">
                <FaUserGroup size={14} className="w-6 h-6 mr-2" />
                <p>Team Members</p>
              </div>
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleItemClick(`/${companyName}/app/company-settings`)
              }
            >
              <div className="flex">
                <IoSettingsOutline size={14} className="w-6 h-6 mr-2" />
                <p>Company Settings</p>
              </div>
            </MenuItem>
            {isAppAdmin && (
              <MenuItem
                onClick={() =>
                  handleItemClick(`/${companyName}/app/subscription`)
                }
              >
                <div className="flex">
                  <PiNewspaper size={14} className="w-6 h-6 mr-2" />
                  <p>Subscription</p>
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
