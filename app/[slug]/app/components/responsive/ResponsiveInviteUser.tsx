import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus, UserRole } from "../../../../../utils/enum";
import { isValidEmail } from "../../../../../utils/helpers";
import useMediaQuery from "@/hooks/useMediaQuery";
import InviteUserModal from "../modals/InviteUserModal";
import InviteUserDrawer from "../drawer/InviteUserDrawer";
import { PendingInvitationUser } from "@/types/types";

interface ResponsiveInviteUserProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clerkOrganizationId: string;
  onInviteSuccess: (newPendingUser: PendingInvitationUser) => void;
  isHostlyAdmin: boolean;
}

const ResponsiveInviteUser: React.FC<ResponsiveInviteUserProps> = ({
  isOpen,
  onOpenChange,
  clerkOrganizationId,
  onInviteSuccess,
  isHostlyAdmin,
}) => {
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<UserRole>(
    isHostlyAdmin ? UserRole.Hostly_Moderator : UserRole.Promoter
  );
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const createClerkInvitation = useAction(api.clerk.createClerkInvitation);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSave = async () => {
    if (!isValidEmail(inviteEmail)) {
      setInviteError("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);

    try {
      const result = await createClerkInvitation({
        clerkOrgId: clerkOrganizationId,
        role: inviteRole,
        email: inviteEmail,
      });
      if (result.status === ResponseStatus.ERROR) {
        setInviteError(result.error);
      } else {
        const newPendingUser: PendingInvitationUser = {
          clerkInvitationId: result.data.clerkInvitationId,
          email: inviteEmail,
          role: inviteRole,
        };

        toast({
          title: "Invitation Sent",
          description: "User has been invited",
        });
        onOpenChange(false);
        onInviteSuccess(newPendingUser);
        setInviteEmail("");
      }
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sharedProps = {
    isOpen,
    onOpenChange,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviteError,
    setInviteError,
    isLoading,
    onSubmit: handleSave,
    isHostlyAdmin,
  };

  return isDesktop ? (
    <InviteUserModal {...sharedProps} onClose={() => onOpenChange(false)} />
  ) : (
    <InviteUserDrawer {...sharedProps} />
  );
};

export default ResponsiveInviteUser;
