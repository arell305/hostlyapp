"use client";
import React, { useState, memo, useCallback } from "react";
import { useClerk } from "@clerk/nextjs";
import EditPromoCodeDialog from "./EditPromoCodeDialog";
import PromoterUserButton from "./PromoterUserbutton";
import AdminUserButton from "./AdminUserButton";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { RiCloseLargeLine } from "react-icons/ri";
import { UserRole } from "../../../../utils/enum";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface DashboardNavbarProps {
  toggleNavbar: () => void;
  isOpen: boolean;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = memo(
  ({ toggleNavbar, isOpen }) => {
    const { user, loaded, organization } = useClerk();

    const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] = useState(false);

    const userFromDb = useQuery(
      api.users.findUserByClerkId,
      user
        ? {
            clerkUserId: user?.id,
          }
        : "skip"
    );

    const role = user?.organizationMemberships[0]?.role;
    const isPromoterAdmin =
      role === UserRole.Admin && organization?.name !== "Admin";

    const togglePromoCodeModal = useCallback(() => {
      setIsPromoCodeModalOpen((prev) => !prev);
    }, []);

    // Show loading state until user data is loaded
    if (!loaded || !userFromDb) {
      return (
        <nav className="w-full z-10 top-0 border-b border-gray-200 fixed h-14 bg-white">
          {/* Loading indicator can be added here */}
        </nav>
      );
    }
    return (
      <nav
        className={`w-full items-center shadow md:shadow-none md:border-none bg-white z-10 top-0 fixed h-12 transition-colors duration-300  ${isOpen ? "rounded-[1px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.1)]" : " border-b border-gray-200"}`}
      >
        <div className="flex h-full items-center justify-between mx-auto p-2.5">
          <div className="flex-grow  md:block hidden">
            <a href="/" className="text-2xl font-semibold font-playfair pl-4">
              {organization?.name ?? "Hostly"}
            </a>
          </div>
          {/* Left Side: Toggle Button */}
          <div className="flex items-center">
            <button
              onClick={toggleNavbar}
              type="button"
              className={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-white transition-transform duration-300 ${isOpen ? "rotate-90" : ""} md:hidden`}
              style={{ zIndex: 60 }}
            >
              {isOpen ? (
                <RiCloseLargeLine className="w-6 h-6 text-black" />
              ) : (
                <HiOutlineMenuAlt4 className="w-6 h-6 text-black" />
              )}
            </button>
          </div>

          {/* Center: Organization Name */}
          <div className="flex-grow flex justify-center md:hidden">
            <a href="/" className="text-2xl font-semibold font-playfair ">
              {organization?.name ?? "Hostly"}
            </a>
          </div>

          {/* Right Side: User Buttons */}
          <div className="ml-auto flex items-center">
            <div className="flex space-x-3">
              {isPromoterAdmin ? (
                <AdminUserButton />
              ) : (
                <PromoterUserButton
                  promoCode={userFromDb?.data?.user.promoCode}
                  onEditPromoCode={togglePromoCodeModal}
                />
              )}
            </div>
          </div>
        </div>
        {isPromoCodeModalOpen && (
          <EditPromoCodeDialog
            isOpen={isPromoCodeModalOpen}
            setIsOpen={setIsPromoCodeModalOpen}
            user={userFromDb?.data?.user}
          />
        )}
      </nav>
    );
  }
);

export default DashboardNavbar;
