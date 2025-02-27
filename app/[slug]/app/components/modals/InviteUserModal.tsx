import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { UserRole, roleMap } from "../../../../../utils/enum";
import { changeableRoles } from "@/types/enums";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  inviteRole: UserRole;
  setInviteRole: (role: UserRole) => void;
  inviteError: string | null;
  setInviteError: (error: string | null) => void;
  isLoading: boolean;
  onSubmit: () => void;
  isHostlyAdmin: boolean;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  inviteError,
  setInviteError,
  isLoading,
  onSubmit,
  isHostlyAdmin,
}) => {
  // Determine which roles are selectable
  const selectableRoles = isHostlyAdmin
    ? [UserRole.Hostly_Moderator]
    : changeableRoles;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setInviteEmail("");
        onClose();
      }}
    >
      <DialogContent className="w-[90vw] md:min-w-0 rounded ">
        <DialogHeader>
          <DialogTitle className="flex">Invite User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Enter email"
            value={inviteEmail}
            onChange={(e) => {
              setInviteEmail(e.target.value);
              setInviteError(null);
            }}
            className={inviteError ? "border-red-500" : ""}
          />
          <Select
            onValueChange={(value) => setInviteRole(value as UserRole)}
            value={inviteRole}
          >
            <SelectTrigger className="w-[180px] mt-4">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {selectableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {roleMap[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p
          className={`text-sm mt-1 ${
            inviteError ? "text-red-500" : "text-transparent"
          }`}
        >
          {inviteError || "Placeholder to maintain height"}
        </p>
        <DialogFooter>
          <Button
            disabled={isLoading}
            variant="ghost"
            onClick={onClose}
            className="font-semibold w-[140px]"
          >
            Cancel
          </Button>
          <Button
            className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              "Invite"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal;
