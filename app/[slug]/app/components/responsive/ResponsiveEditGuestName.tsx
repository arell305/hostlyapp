import React from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { DESKTOP_WIDTH } from "@/types/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BaseDrawer from "../drawer/BaseDrawer";
import LabeledInputField from "@/components/shared/fields/LabeledInputField";
import FormContainer from "@/components/shared/containers/FormContainer";
import FormActions from "@/components/shared/buttonContainers/FormActions";
import PhoneNumberInput from "@/components/shared/fields/PhoneNumberInput";

interface ResponsiveEditGuestNameProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editName: string;
  setEditName: (name: string) => void;
  setEditNameError: (error: string | null) => void;
  error: string | null;
  isLoading: boolean;
  onSaveGuestName: () => Promise<void>;
  editNameError: string | null;
  editPhoneNumber: string;
  setEditPhoneNumber: (phoneNumber: string) => void;
  editPhoneNumberError: string | null;
  setEditPhoneNumberError: (error: string | null) => void;
}

const ResponsiveEditGuestName: React.FC<ResponsiveEditGuestNameProps> = ({
  isOpen,
  onOpenChange,
  editName,
  setEditName,
  setEditNameError,
  error,
  isLoading,
  onSaveGuestName,
  editNameError,
  editPhoneNumber,
  setEditPhoneNumber,
  editPhoneNumberError,
  setEditPhoneNumberError,
}) => {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

  const nameInputField = (
    <FormContainer>
      <LabeledInputField
        label="Name"
        name="editName"
        placeholder="Enter name"
        value={editName}
        onChange={(e) => {
          setEditName(e.target.value);
          setEditNameError(null);
        }}
        error={editNameError}
      />
      <PhoneNumberInput
        label="Phone Number (Optional)"
        name="editPhoneNumber"
        placeholder="Enter phone number"
        value={editPhoneNumber}
        onChange={(phoneNumber) => {
          setEditPhoneNumber(phoneNumber);
          setEditPhoneNumberError(null);
        }}
        error={editPhoneNumberError}
      />
    </FormContainer>
  );

  const isDisabled = isLoading || !editName || !editName.trim();
  const description = "Update the name and optional phone number of the guest.";

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90vw] md:min-w-0 rounded">
          <DialogHeader>
            <DialogTitle className="flex">Guest Name</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {nameInputField}
          <FormActions
            onCancel={() => onOpenChange(false)}
            onSubmit={onSaveGuestName}
            cancelText="Cancel"
            submitText="Save"
            isLoading={isLoading}
            error={error}
            isSubmitDisabled={isDisabled}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Guest Name"
      description={description}
      confirmText="Save"
      cancelText="Cancel"
      onSubmit={onSaveGuestName}
      error={error}
      isLoading={isLoading}
    >
      <div className="space-y-4 px-4">{nameInputField}</div>
    </BaseDrawer>
  );
};

export default ResponsiveEditGuestName;
