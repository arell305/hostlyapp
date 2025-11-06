"use client";

import LabeledInputField from "@/shared/ui/fields/LabeledInputField";
import FormContainer from "@/shared/ui/containers/FormContainer";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import PhoneNumberInput from "@/shared/ui/fields/PhoneNumberInput";
import ResponsiveModal from "./ResponsiveModal";

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
  const isDisabled = isLoading || !editName || !editName.trim();
  const description = "Update the name and optional phone number of the guest.";

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
      <FormActions
        onCancel={() => onOpenChange(false)}
        onSubmit={onSaveGuestName}
        cancelText="Cancel"
        submitText="Save"
        isLoading={isLoading}
        error={error}
        isSubmitDisabled={isDisabled}
      />
    </FormContainer>
  );

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Guest Name"
      description={description}
    >
      {nameInputField}
    </ResponsiveModal>
  );
};

export default ResponsiveEditGuestName;
