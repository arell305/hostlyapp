import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, roleMap } from "../../../../utils/enum";
import { changeableRoles } from "@/utils/enums";
import BaseDrawer from "../drawer/BaseDrawer";

interface EditUserDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUserClerkId: string;
  currentRole: UserRole; // Renamed for clarity
  clerkOrgId: string;
  fullName: string;
  onSaveRole: (clerkUserId: string, newRole: UserRole) => void; // Callback to notify parent
}

const EditUserDrawer: React.FC<EditUserDrawerProps> = ({
  isOpen,
  onOpenChange,
  editingUserClerkId,
  currentRole,
  clerkOrgId,
  fullName,
  onSaveRole,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (selectedRole === currentRole) {
      return onOpenChange(false); // Close the drawer if no changes are made
    }

    onSaveRole(editingUserClerkId, selectedRole); // Notify parent to handle API call
    onOpenChange(false); // Close the drawer after saving
  };

  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit User"
      description={`Editing role for ${fullName}`}
      confirmText="Update"
      cancelText="Cancel"
      onSubmit={handleSave} // Handle save in parent
    >
      <div className="space-y-4 px-4">
        <Select
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as UserRole)}
        >
          <SelectTrigger className="w-full">
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

        {error && <p className="text-sm mt-1 text-red-500">{error}</p>}
      </div>
    </BaseDrawer>
  );
};

export default EditUserDrawer;
