"use client";

import { useCallback, useEffect, useState } from "react";

import { UserButton } from "@clerk/nextjs";
import { isPromoter } from "@/shared/utils/permissions";
import EditPromoCodeDialog from "../modals/EditPromoCodeDialog";
import { User } from "lucide-react";
import { roleMap } from "@/shared/types/enums";
import { UserRole } from "@/shared/types/enums";
import { FaEdit } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import NProgress from "nprogress";
import { useContextOrganization } from "@/contexts/OrganizationContext";

const NavbarActions = () => {
  const { orgRole, user: userData } = useContextOrganization();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserButton, setShowUserButton] = useState<boolean>(false);
  const showPromoCode = isPromoter(orgRole);
  const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowUserButton(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const togglePromoCodeModal = useCallback(() => {
    setIsPromoCodeModalOpen((prev) => !prev);
  }, []);

  const promoCode = userData?.promoCode;
  const promoCodeDisplay = promoCode
    ? `Promo Code: ${promoCode}`
    : "Add Promo Code";

  const handleRoleClick = () => {
    const slug = pathname.split("/")[1];
    NProgress.start();
    router.push(`/${slug}/app/team/${userData?._id}`);
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="h-8 w-8">
        {showUserButton ? (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label={`Role: ${roleMap[orgRole as UserRole]}`}
                labelIcon={<User size={16} className="text-sm" />}
                onClick={handleRoleClick}
              />
              {showPromoCode && (
                <UserButton.Action
                  label={promoCodeDisplay}
                  labelIcon={<FaEdit />}
                  onClick={togglePromoCodeModal}
                />
              )}
            </UserButton.MenuItems>
          </UserButton>
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
