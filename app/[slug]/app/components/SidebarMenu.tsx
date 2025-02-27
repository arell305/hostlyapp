"use client";
import { Protect, useClerk } from "@clerk/nextjs";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useParams, useRouter } from "next/navigation";
import { IoBusinessOutline } from "react-icons/io5";
import { RiTeamLine } from "react-icons/ri";
import { IoCalendarClearOutline } from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { PiNewspaper } from "react-icons/pi";
import { IoHomeOutline } from "react-icons/io5";
import { ClerkPermissions, UserRole } from "../../../../utils/enum";
import { BiLogoStripe } from "react-icons/bi";
import { useAuth } from "@clerk/nextjs";
import { FaCirclePlus } from "react-icons/fa6";
import Link from "next/link";

interface SidebarMenuProps {
  toggleSidebar?: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleSidebar }) => {
  const { organization } = useClerk();
  const { has } = useAuth();
  const router = useRouter();
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
    setOrgName(organization?.name ?? "Hostly");
  }, [organization]);

  const isAppAdmin = has?.({ permission: ClerkPermissions.MODERATES_APP });

  const handleItemClick = (path: string) => {
    router.push(path);
    if (toggleSidebar) {
      toggleSidebar();
    }
  };
  const [orgName, setOrgName] = useState<string>("Hostly");

  if (isLoading) {
    return (
      <Sidebar
        className="h-screen bg-blue-200 hidden md:block"
        style={{
          width: "320px",
          overflow: "hidden",
        }}
      ></Sidebar>
    );
  }
  return (
    <Sidebar
      className="h-screen bg-blue-200 text-base md:text-sm"
      style={{
        width: "320px",
        overflow: "hidden",
      }}
    >
      <div className="mt-3 ml-6 mb-4">
        <p
          className="text-2xl font-semibold cursor-pointer"
          onClick={() => {
            isAppAdmin
              ? handleItemClick("/admin/app/companies")
              : handleItemClick(`/${slug}/app/dashboard`);
          }}
        >
          {orgName}
        </p>
      </div>

      <Menu
        className=""
        menuItemStyles={{
          button: {
            height: "var(--menu-item-height)",
          },
        }}
      >
        <Protect
          condition={(has) =>
            has({ permission: ClerkPermissions.MODERATES_APP })
          }
        >
          <MenuItem onClick={() => handleItemClick("/admin/app/companies")}>
            <div className="flex items-center gap-x-3">
              <IoBusinessOutline className="text-xl md:text-lg" />
              <p className="sm:text-xs">Companies</p>
            </div>
          </MenuItem>
          <MenuItem onClick={() => handleItemClick("/admin/app/team")}>
            <div className="flex items-center gap-x-3">
              <RiTeamLine className="text-xl md:text-lg" />
              <p className="sm:text-xs">Hostly Members</p>
            </div>
          </MenuItem>
          <div className="border-b border-gray-300 my-4"></div>
          <Link href={`/${slug}/app/`}>
            <div className="ml-6 mt-4 mb-2 text-2xl font-semibold">{slug}</div>
          </Link>
        </Protect>
        <MenuItem onClick={() => handleItemClick(`/${slug}/app`)}>
          <div className="flex items-center gap-x-3">
            <IoHomeOutline className="text-xl md:text-lg" />
            <p className="sm:text-xs">Home</p>
          </div>
        </MenuItem>

        <Protect
          condition={(has) =>
            has({ permission: ClerkPermissions.CREATE_EVENT })
          }
        >
          <MenuItem onClick={() => handleItemClick(`/${slug}/app/add-event`)}>
            <div className="flex items-center gap-x-3">
              <FaCirclePlus className="text-xl md:text-lg" />
              <p className="sm:text-xs">Add Event</p>
            </div>
          </MenuItem>
        </Protect>
        <MenuItem onClick={() => handleItemClick(`/${slug}`)}>
          <div className="flex items-center gap-x-3">
            <IoCalendarClearOutline className="text-xl md:text-lg" />
            <p className="sm:text-xs">Customer Calendar</p>
          </div>
        </MenuItem>
        <MenuItem onClick={() => handleItemClick(`/${slug}/app/team`)}>
          <div className="flex items-center gap-x-3">
            <FaUserGroup className="text-xl md:text-lg" />
            <p className="sm:text-xs">Team Members</p>
          </div>
        </MenuItem>
        <MenuItem
          onClick={() => handleItemClick(`/${slug}/app/company-settings`)}
        >
          <div className="flex items-center gap-x-3">
            <IoSettingsOutline className="text-xl md:text-lg" />
            <p className="sm:text-xs">Company Settings</p>
          </div>
        </MenuItem>
        <Protect
          condition={(has) =>
            has({ permission: ClerkPermissions.VIEW_SUBSCRIPTION })
          }
        >
          <MenuItem
            onClick={() => handleItemClick(`/${slug}/app/subscription`)}
          >
            <div className="flex items-center gap-x-3">
              <PiNewspaper className="text-xl md:text-lg" />
              <p className="sm:text-xs">Subscription</p>
            </div>
          </MenuItem>
        </Protect>
        <Protect condition={(has) => has({ role: UserRole.Admin })}>
          <MenuItem onClick={() => handleItemClick(`/${slug}/app/stripe`)}>
            <div className="flex items-center gap-x-3">
              <BiLogoStripe className="text-xl md:text-lg" />
              <p className="sm:text-xs">Stripe</p>
            </div>
          </MenuItem>
        </Protect>
      </Menu>
    </Sidebar>
  );
};

export default SidebarMenu;
