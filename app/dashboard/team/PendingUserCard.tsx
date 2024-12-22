import { useAction } from "convex/react";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "../../../convex/_generated/api";
import { FaEllipsisV } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { ResponseStatus, roleMap } from "../../../utils/enum";
import ConfirmModal from "../components/ConfirmModal";
import useMediaQuery from "@/hooks/useMediaQuery";
import BaseDrawer from "@/dashboard/components/drawer/BaseDrawer";
import ResponsiveConfirm from "@/dashboard/components/responsive/ResponsiveConfirm";

interface PendingUserCardProps {
  clerkInvitationId: string;
  email: string;
  role: string;
  clerkOrgId: string;
  clerkUserId: string;
  onRevoke: (clerkInvitationId: string) => void;
}

const PendingUserCard: React.FC<PendingUserCardProps> = ({
  clerkInvitationId,
  email,
  role,
  clerkOrgId,
  clerkUserId,
  onRevoke,
}) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showResponsiveConfirm, setShowResponsiveConfirm] =
    useState<boolean>(false);
  const { toast } = useToast();

  // Create refs for the menu and its trigger
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuTriggerRef = useRef<HTMLDivElement | null>(null);

  const handleRevoke = () => {
    setShowResponsiveConfirm(true);
    setShowMenu(false);
  };

  const handleRevokeConfirmation = async () => {
    onRevoke(clerkInvitationId); // Call the parent handler with the ID
    setShowResponsiveConfirm(false);
  };

  // Handle clicks outside of the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuTriggerRef.current &&
        !menuTriggerRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, menuTriggerRef]);

  return (
    <div className="border-b border-gray-300 p-4 w-full flex items-center justify-between">
      <div>
        <h3 className="font-bold">{email}</h3>
        <p>{roleMap[role]}</p>
      </div>
      <div ref={menuTriggerRef}>
        <FaEllipsisV
          onClick={() => setShowMenu((prev) => !prev)}
          className="cursor-pointer"
        />
        {showMenu &&
          createPortal(
            <div
              ref={menuRef}
              style={{
                position: "absolute",
                top: menuTriggerRef.current?.getBoundingClientRect().bottom,
                left: menuTriggerRef.current?.getBoundingClientRect().right,
                transform: "translateX(-100%)",
              }}
              className="z-50 w-48 bg-white border rounded-md shadow-lg"
            >
              <button
                onClick={handleRevoke}
                className="block px-4 py-2 text-altRed hover:bg-gray-200 w-full text-left"
              >
                Revoke Invitation
              </button>
            </div>,
            document.body
          )}
      </div>

      <ResponsiveConfirm
        isOpen={showResponsiveConfirm}
        title="Confirm User Revocation"
        confirmText="Revoke User"
        cancelText="Cancel"
        content="Are you sure you want to revoke this invitation? This action cannot be undone."
        confirmVariant="destructive"
        modalProps={{
          onClose: () => setShowResponsiveConfirm(false),
          onConfirm: handleRevokeConfirmation,
        }}
        drawerProps={{
          onOpenChange: (open: boolean) => setShowResponsiveConfirm(open),
          onSubmit: handleRevokeConfirmation,
        }}
      />
    </div>
  );
};

export default PendingUserCard;
