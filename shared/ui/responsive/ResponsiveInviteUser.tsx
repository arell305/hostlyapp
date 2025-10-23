"use client";

import { useState } from "react";
import { changeableRoles, roleMap, UserRole } from "@shared/types/enums";
import { useInviteUser } from "@/domain/clerk/useInviteUser";
import FormContainer from "@/shared/ui/containers/FormContainer";
import LabeledInputField from "@/shared/ui/fields/LabeledInputField";
import LabeledSelectField from "@/shared/ui/fields/LabeledSelectField";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import { validateInviteForm } from "@/shared/utils/form-validation/validateInviteForm";
import { isValidEmail } from "@/shared/utils/helpers";
import ResponsiveModal from "./ResponsiveModal";

interface ResponsiveInviteUserProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clerkOrganizationId: string;
  isAdminSlug: boolean;
}

const ResponsiveInviteUser: React.FC<ResponsiveInviteUserProps> = ({
  isOpen,
  onOpenChange,
  clerkOrganizationId,
  isAdminSlug,
}) => {
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<UserRole>(
    isAdminSlug ? UserRole.Hostly_Moderator : UserRole.Promoter
  );
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    role?: string;
  }>({});

  const { inviteUser, isLoading, error, setError } = useInviteUser();

  const resetState = () => {
    setError(null);
    setInviteEmail("");
    setInviteRole(isAdminSlug ? UserRole.Hostly_Moderator : UserRole.Promoter);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleSave = async () => {
    const errors = validateInviteForm(inviteEmail, inviteRole);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const success = await inviteUser(
      clerkOrganizationId,
      inviteRole,
      inviteEmail
    );
    if (success) {
      handleClose();
    }
  };

  const isDisabled = !isValidEmail(inviteEmail);

  const formContent = (
    <FormContainer>
      <LabeledInputField
        label="Email"
        type="email"
        placeholder="Enter email"
        name="email"
        value={inviteEmail}
        onChange={(e) => {
          setInviteEmail(e.target.value);
          setFormErrors((prev) => ({ ...prev, email: undefined }));
        }}
        error={formErrors.email}
      />

      <LabeledSelectField
        label="Role"
        value={inviteRole}
        onChange={(value) => {
          setInviteRole(value as UserRole);
          setFormErrors((prev) => ({ ...prev, role: undefined }));
        }}
        options={(isAdminSlug
          ? [UserRole.Hostly_Moderator]
          : changeableRoles
        ).map((role) => ({
          value: role,
          label: roleMap[role],
        }))}
        placeholder="Select a role"
        error={formErrors.role}
      />

      <FormActions
        onCancel={handleClose}
        onSubmit={handleSave}
        isLoading={isLoading}
        submitText="Invite"
        error={error}
        isSubmitDisabled={isDisabled}
      />
    </FormContainer>
  );

  const title = "Invite User";
  const description = "Enter in an email and select a role to invite a user.";

  return (
    <ResponsiveModal
      title={title}
      description={description}
      isOpen={isOpen}
      onOpenChange={handleClose}
    >
      {formContent}
    </ResponsiveModal>
  );
};

export default ResponsiveInviteUser;
