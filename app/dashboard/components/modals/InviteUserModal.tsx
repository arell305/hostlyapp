import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UserRole, roleMap } from "../../../../utils/enum";
import { isValidEmail } from "../../../../utils/helpers";
import { changeableRoles } from "@/utils/enums";
import { Loader2 } from "lucide-react";

interface UpdateGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  clerkOrganizationId: string;
  inviterUserClerkId: string;
}

const InviteUserModal: React.FC<UpdateGuestModalProps> = ({
  isOpen,
  onClose,
  clerkOrganizationId,
  inviterUserClerkId,
}) => {
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.Promoter);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const createClerkInvitation = useAction(api.clerk.createClerkInvitation);

  const handleSave = async () => {
    if (!isValidEmail(inviteEmail)) {
      setInviteError("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);

    try {
      const result = await createClerkInvitation({
        clerkOrgId: clerkOrganizationId,
        clerkUserId: inviterUserClerkId,
        role: inviteRole,
        email: inviteEmail,
      });

      if (result.success) {
        toast({
          title: "Invitation Sent",
          description: result.message,
        });
        onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded">
        <DialogHeader>
          <DialogTitle className="flex">Invite User</DialogTitle>
        </DialogHeader>
        <input
          type="email"
          placeholder="Enter email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className={`w-full border-b-2 bg-transparent py-1 text-gray-800 focus:outline-none 
          ${inviteError ? "border-red-500" : "border-gray-300"} 
          focus:border-customDarkBlue`}
        />

        <select
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value as UserRole)}
          className="border rounded px-4 py-2  w-[180px] focus:border-customDarkBlue focus:outline-none"
        >
          {changeableRoles.map((role) => (
            <option key={role} value={role}>
              {roleMap[role]}
            </option>
          ))}
        </select>
        {inviteError && <p className="text-red-500">{inviteError}</p>}
        <div className="flex justify-center space-x-10">
          <Button
            disabled={isLoading}
            variant="ghost"
            onClick={onClose}
            className="font-semibold  w-[140px]"
          >
            Cancel
          </Button>
          <Button
            className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
            onClick={handleSave}
            disabled={isLoading}
          >
            {" "}
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              "Invite"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal;
