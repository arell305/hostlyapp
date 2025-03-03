import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, roleMap } from "../../../../../utils/enum";
import { changeableRoles } from "@/types/enums";
import BaseDrawer from "./BaseDrawer";

interface EditUserDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  onSaveRole: () => void;
  error: string | null;
  isLoading: boolean;
  setSelectedRole: (role: UserRole) => void;
  selectedRole: UserRole;
}

const EditUserDrawer: React.FC<EditUserDrawerProps> = ({
  isOpen,
  onOpenChange,
  fullName,
  onSaveRole,
  error,
  isLoading,
  setSelectedRole,
  selectedRole,
}) => {
  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit User"
      description={`Editing role for ${fullName}`}
      confirmText={isLoading ? "Updating..." : "Update"}
      cancelText="Cancel"
      onSubmit={onSaveRole}
      error={error}
      isLoading={isLoading}
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
