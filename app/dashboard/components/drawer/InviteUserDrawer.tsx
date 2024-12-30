import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UserRole, roleMap } from "../../../../utils/enum";
import { changeableRoles } from "@/types/enums";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import BaseDrawer from "./BaseDrawer";

interface InviteUserDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  inviteRole: UserRole;
  setInviteRole: (role: UserRole) => void;
  inviteError: string | null;
  setInviteError: (error: string | null) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

const InviteUserDrawer: React.FC<InviteUserDrawerProps> = ({
  isOpen,
  onOpenChange,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  inviteError,
  setInviteError,
  isLoading,
  onSubmit,
}) => {
  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Invite User"
      description="Enter email and select role to invite a new user"
      onSubmit={onSubmit}
      confirmText={isLoading ? "Inviting..." : "Invite"}
      cancelText="Cancel"
      error={inviteError}
      isLoading={isLoading}
    >
      <div className="space-y-4 px-4">
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
          <SelectTrigger className="w-full mt-4">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {changeableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {roleMap[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </BaseDrawer>
  );
};

export default InviteUserDrawer;
