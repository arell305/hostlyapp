import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, roleMap } from "../../../../../utils/enum";
import { changeableRoles } from "@/types/enums";

interface EditingUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullName: string;
  selectedRole: UserRole; // Current selected role, managed by parent
  setSelectedRole: (role: UserRole) => void; // Function to update selected role
  error: string | null; // Error state, managed by parent
  isLoading: boolean; // Loading state, managed by parent
  onSaveRole: () => void; // Handler for saving the role, provided by parent
}

const EditingUserModal: React.FC<EditingUserModalProps> = ({
  isOpen,
  onClose,
  fullName,
  selectedRole,
  setSelectedRole,
  error,
  isLoading,
  onSaveRole,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded">
        <DialogHeader>
          <DialogTitle className="flex">Edit User</DialogTitle>
        </DialogHeader>
        <p className="mb-2">{fullName}</p>
        <Select
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as UserRole)}
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {changeableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {roleMap[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p
          className={`text-sm mt-1 ${
            error ? "text-red-500" : "text-transparent"
          }`}
        >
          {error || "Placeholder to maintain height"}
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
            onClick={onSaveRole}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditingUserModal;
