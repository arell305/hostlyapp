"use client";
import React, { useState, useEffect, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import { useOrganization } from "@clerk/nextjs";
import { FaEdit } from "react-icons/fa";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRoleEnum } from "@/utils/enums";
import EditPromoCodeDialog from "./EditPromoCodeDialog";
import PromoterUserButton from "./PromoterUseetonbutton";

interface DashboardNavbarProps {
  toggleNavbar: () => void;
  isOpen: boolean;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  toggleNavbar,
  isOpen,
}) => {
  const { organization } = useOrganization();
  const { role, isLoading, user } = useUserRole();
  const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] = useState(false);
  const isPromoter = role === UserRoleEnum.PROMOTER;
  const currentPromoCode = user?.promoterPromoCode?.name;
  const [promoCode, setPromoCode] = useState(currentPromoCode || "");
  const promoCodeDisplay = promoCode
    ? `Promo Code: ${promoCode}`
    : "Add Promo Code";
  console.log("promo Display", promoCodeDisplay);

  const handleEditPromoCode = useCallback(() => {
    setIsPromoCodeModalOpen(true);
  }, []);

  useEffect(() => {
    setPromoCode(currentPromoCode || "");
  }, [currentPromoCode]);

  if (isLoading) {
    return <p>Loading</p>;
  }

  return (
    <nav className="bg-customDarkBlue w-full z-20 top-0 border-b border-gray-200 text-white sticky">
      <div className="flex flex-wrap items-center mx-auto p-2.5">
        <div className="flex items-center">
          <button
            onClick={toggleNavbar}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg hover:border hover:border-white focus:outline-none focus:ring-1 focus:ring-white md:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            {isOpen ? (
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
            ) : (
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
            )}
          </button>
          <a href="#" className="text-2xl font-medium ml-3">
            {organization?.name ?? "Hostly"}
          </a>
        </div>
        <div className="ml-auto">
          {isPromoter ? (
            <PromoterUserButton
              promoCode={promoCode}
              onEditPromoCode={handleEditPromoCode}
            />
          ) : (
            <UserButton />
          )}
        </div>
      </div>
      {isPromoCodeModalOpen && (
        <EditPromoCodeDialog
          isOpen={isPromoCodeModalOpen}
          setIsOpen={setIsPromoCodeModalOpen}
        />
      )}
    </nav>
  );
};

export default DashboardNavbar;
