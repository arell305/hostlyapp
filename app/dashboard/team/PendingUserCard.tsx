// PendingUserCard.tsx
import { useAction } from "convex/react";
import React, { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { FaEllipsisV } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleRevoke = async () => {
    try {
      await revokeOrganizationInvitation({
        clerkOrgId,
        clerkUserId, // Pass appropriate user ID if needed
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
      setShowMenu(false); // Close menu after action
    }
  };

  return (
    <div className="border p-4 rounded shadow-md relative">
      <h3 className="font-bold">{email}</h3>
      <p>Role: {role}</p>

      {/* Ellipsis Icon */}
      <div className="absolute top-2 right-2">
        <FaEllipsisV
          onClick={() => setShowMenu((prev) => !prev)}
          className="cursor-pointer"
        />
        {showMenu && (
          <div className="absolute right-0 bg-white shadow-md rounded mt-1">
            <button
              onClick={handleRevoke}
              className="block px-4 py-2 text-red-600 hover:bg-gray-200"
            >
              Revoke Invitation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingUserCard;
