"use client";

import { useCallback, useEffect, useState } from "react";

import { UserButton } from "@clerk/nextjs";
import { isManager, isPromoter } from "@/shared/utils/permissions";
import EditPromoCodeDialog from "../modals/EditPromoCodeDialog";
import { MessageCircle, User } from "lucide-react";
import { roleMap } from "@/shared/types/enums";
import { UserRole } from "@/shared/types/enums";
import { FaEdit } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import NProgress from "nprogress";
import { useContextOrganization } from "@/shared/hooks/contexts/useContextOrganization";
import NotificationsLoader from "./NotificationsLoader";
import AvatarSkeleton from "../skeleton/AvatarSkeleton";

const NavbarActions = () => {
  const { orgRole, user: userData } = useContextOrganization();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserButton, setShowUserButton] = useState<boolean>(false);
  const showPromoCode = isPromoter(orgRole);
  const showMessage = showPromoCode || isManager(orgRole);
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

  const slug = pathname.split("/")[1];

  const handleRoleClick = () => {
    NProgress.start();
    router.push(`/${slug}/app/team/${userData?._id}`);
  };

  const handleNotificationsClick = () => {
    router.push(`/${slug}/app/campaigns/${userData?._id}`);
    NProgress.start();
  };

  return (
    <div className="flex items-center space-x-3">
      {showMessage && (
        <NotificationsLoader onClick={handleNotificationsClick} />
      )}
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
          <AvatarSkeleton className="h-8 w-8" />
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
