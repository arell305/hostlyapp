"use client";

import { useCallback, useEffect, useState } from "react";

import { UserButton } from "@clerk/nextjs";
import { isPromoter } from "@/utils/permissions";
import PromoterUserButton from "../../PromoterUserbutton";
import EditPromoCodeDialog from "../../EditPromoCodeDialog";
import { UserWithPromoCode } from "@/types/types";

interface NavbarActionsProps {
  orgRole: string;
  userData?: UserWithPromoCode;
}

const NavbarActions = ({ orgRole, userData }: NavbarActionsProps) => {
  const [showUserButton, setShowUserButton] = useState<boolean>(false);
  const showPromoCode = isPromoter(orgRole);
  const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] =
    useState<boolean>(false);

  // Delay UserButton display to prevent layout shift
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowUserButton(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const togglePromoCodeModal = useCallback(() => {
    setIsPromoCodeModalOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex items-center space-x-3">
      <div className="h-8 w-8">
        {showUserButton ? (
          showPromoCode ? (
            <PromoterUserButton
              promoCode={userData?.promoCode}
              onEditPromoCode={togglePromoCodeModal}
            />
          ) : (
            <UserButton />
          )
        ) : (
          <div className="h-full w-full rounded-full bg-gray-700 animate-pulse" />
        )}
      </div>
      {isPromoCodeModalOpen && (
        <EditPromoCodeDialog
          isOpen={isPromoCodeModalOpen}
          setIsOpen={setIsPromoCodeModalOpen}
          user={userData}
        />
      )}
    </div>
  );
};

export default NavbarActions;
