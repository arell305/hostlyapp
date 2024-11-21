"use client";
import React, { useState, useEffect, memo, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import { useOrganization } from "@clerk/nextjs";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRoleEnum } from "@/utils/enums";
import EditPromoCodeDialog from "./EditPromoCodeDialog";
import PromoterUserButton from "./PromoterUserbutton";
import AdminUserButton from "./AdminUserButton";
import EditSubscriptionDialog from "./EditSubscriptionDialog";
import { CiCirclePlus } from "react-icons/ci";
import { FaPlus } from "react-icons/fa";
import { FaPlus as Plus } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useParams, usePathname, useRouter } from "next/navigation";

interface DashboardNavbarProps {
  toggleNavbar: () => void;
  isOpen: boolean;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = memo(
  ({ toggleNavbar, isOpen }) => {
    const { organization } = useOrganization();
    const { role, isLoading, user } = useUserRole();
    const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
      useState(false);
    const [promoCode, setPromoCode] = useState(
      user?.promoterPromoCode?.name || ""
    );
    const router = useRouter();

    const isPromoter = role === UserRoleEnum.PROMOTER;
    const isAdmin = role === UserRoleEnum.PROMOTER_ADMIN;
    const canCreateEvents =
      role === UserRoleEnum.APP_ADMIN || UserRoleEnum.PROMOTER_ADMIN;
    const isAppAdmin = role === UserRoleEnum.APP_ADMIN;

    // Update promoCode if user changes
    useEffect(() => {
      setPromoCode(user?.promoterPromoCode?.name || "");
    }, [user?.promoterPromoCode?.name]);

    // Toggle functions for modals
    const togglePromoCodeModal = useCallback(() => {
      setIsPromoCodeModalOpen((prev) => !prev);
    }, []);

    const toggleSubscriptionModal = useCallback(() => {
      setIsSubscriptionModalOpen((prev) => !prev);
    }, []);

    const handleAddEvent = () => {
      // const targetUrl = isAppAdmin
      //   ? `/add-event?organizationId=${cleanOrganizationId}`
      //   : "/add-event";
      const targetUrl = "/add-event";
      router.push(targetUrl);
    };

    // Return early if loading
    if (isLoading) return <p>Loading</p>;

    return (
      <nav className="bg-customDarkBlue w-full z-20 top-0 border-b border-gray-200 text-white fixed">
        <div className="flex flex-wrap items-center mx-auto p-2.5">
          <div className="flex items-center">
            <button
              onClick={toggleNavbar}
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg hover:border hover:border-white focus:outline-none focus:ring-1 focus:ring-white md:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              {isOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
            <a href="/" className="text-2xl font-medium ml-3">
              {organization?.name ?? "Hostly"}
            </a>
          </div>
          {/* <CiCirclePlus size={26} /> */}
          <div className="ml-auto">
            <div className="flex space-x-3">
              {/* {canCreateEvents && (
                <Button onClick={handleAddEvent} className="w-[100px] h-[35px]">
                  <CiCirclePlus size={30} className="w-10 h-10 text-2xl" />
                  <span className="pl-1"> Event</span>
                </Button>
              )} */}
              {isAdmin ? (
                <AdminUserButton onEditSubscription={toggleSubscriptionModal} />
              ) : isPromoter ? (
                <PromoterUserButton
                  promoCode={promoCode}
                  onEditPromoCode={togglePromoCodeModal}
                />
              ) : (
                <UserButton />
              )}
            </div>
          </div>
        </div>
        {isPromoCodeModalOpen && (
          <EditPromoCodeDialog
            isOpen={isPromoCodeModalOpen}
            setIsOpen={setIsPromoCodeModalOpen}
          />
        )}
        {isSubscriptionModalOpen && (
          <EditSubscriptionDialog
            isOpen={isSubscriptionModalOpen}
            setIsOpen={setIsSubscriptionModalOpen}
          />
        )}
      </nav>
    );
  }
);

// SVG Components for Icons
const HamburgerIcon = () => (
  <svg
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 17 14"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M1 1h15M1 7h15M1 13h15"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 14 14"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M1 1l12 12M13 1L1 13"
    />
  </svg>
);

export default DashboardNavbar;
