import { useAction } from "convex/react";
import React, { useState, useRef, useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { FaEllipsisV } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { roleMap } from "../../../utils/enum";
import ConfirmModal from "../components/ConfirmModal";

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
  const revokeOrganizationInvitation = useAction(
    api.clerk.revokeOrganizationInvitation
  );
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showRevokeConfirmModal, setShowRevokeConfirmModal] =
    useState<boolean>(false);
  const { toast } = useToast();

  // Create a ref for the menu
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleRevoke = () => {
    setShowRevokeConfirmModal(true);
  };

  const handleRevokeConfirmation = async () => {
    try {
      await revokeOrganizationInvitation({
        clerkOrgId,
        clerkUserId,
        clerkInvitationId,
      });
      onRevoke(clerkInvitationId);
      toast({
        title: "Invitation Revoked",
        description: "The invitation has successfully been revoked",
      });
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
      toast({
        title: "Error",
        description: "Failed to revoke invitation. Please try again",
        variant: "destructive",
      });
    } finally {
      setShowMenu(false);
    }
  };

  // Handle clicks outside of the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="border-b border-gray-300 p-4 w-full flex items-center justify-between">
      <div>
        <h3 className="font-bold">{email}</h3>
        <p>{roleMap[role]}</p>
      </div>
      <div ref={menuRef} className="">
        <FaEllipsisV
          onClick={() => setShowMenu((prev) => !prev)}
          className="cursor-pointer"
        />
        {showMenu && (
          <div className="absolute right-4 bg-white shadow-md rounded border">
            <button
              onClick={handleRevoke}
              className="block px-4 py-2 text-altRed hover:bg-gray-200"
            >
              Revoke Invitation
            </button>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={showRevokeConfirmModal}
        onClose={() => setShowRevokeConfirmModal(false)}
        onConfirm={handleRevokeConfirmation}
        title="Confirm User Revocation"
        message="Are you sure you want to revoke this invitation? This action cannot be undone."
        confirmText="Revoke User"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PendingUserCard;
