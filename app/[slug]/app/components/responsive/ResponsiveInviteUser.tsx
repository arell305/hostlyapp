import React, { useEffect, useState } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { DESKTOP_WIDTH } from "@/types/constants";
import { changeableRoles, roleMap, UserRole } from "@/types/enums";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useInviteUser } from "../../team/hooks/useInviteUser";
import FormContainer from "@/components/shared/containers/FormContainer";
import LabeledInputField from "@/components/shared/fields/LabeledInputField";
import LabeledSelectField from "@/components/shared/fields/LabeledSelectField";
import FormActions from "@/components/shared/buttonContainers/FormActions";
import { validateInviteForm } from "../../../../../utils/form-validation/validateInviteForm";
import { isValidEmail } from "@/utils/helpers";

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
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    role?: string;
  }>({});

  const { inviteUser, isLoading, error, setError } = useInviteUser();

  useEffect(() => {
    if (!isDesktop) {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isDesktop]);

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
  const description = "Invite a user to your team.";

  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {formContent}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="h-[100svh] flex flex-col overscroll-contain">
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
        {formContent}
      </DrawerContent>
    </Drawer>
  );
};

export default ResponsiveInviteUser;
