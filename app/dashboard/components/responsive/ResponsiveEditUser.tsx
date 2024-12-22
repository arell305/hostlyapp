import React, { useState } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import EditingUserModal from "../modals/EditingUserModal";
import EditUserDrawer from "../drawer/EditUserDrawer"; // Drawer for mobile
import { UserRole } from "../../../../utils/enum";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface ResponsiveEditUserProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUserClerkId: string;
  role: UserRole;
  clerkOrgId: string;
  fullName: string;
}

const ResponsiveEditUser: React.FC<ResponsiveEditUserProps> = ({
  isOpen,
  onOpenChange,
  editingUserClerkId,
  role,
  clerkOrgId,
  fullName,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(role);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateOrganizationMemberships = useAction(
    api.clerk.updateOrganizationMemberships
  );

  const handleSaveRole = async () => {
    setError(null);
    if (selectedRole === role) {
      return onOpenChange(false); // No change in role
    }

    setIsLoading(true);
    try {
      await updateOrganizationMemberships({
        clerkOrgId,
        clerkUserId: editingUserClerkId,
        role: selectedRole,
      });

      onOpenChange(false); // Close modal/drawer after success
    } catch (err) {
      console.error("Failed to update role:", err);
      setError("Failed to update role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sharedProps = {
    isOpen,
    onClose: () => onOpenChange(false),
    fullName,
    selectedRole, // Pass current selected role
    setSelectedRole, // Pass function to update selected role
    error, // Pass error state
    isLoading, // Pass loading state
    onSaveRole: handleSaveRole, // Save handler for API call
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? (
    <EditingUserModal {...sharedProps} />
  ) : (
    <EditUserDrawer {...sharedProps} />
  );
};

export default ResponsiveEditUser;
