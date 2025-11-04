"use client";

import { useState } from "react";
import ResponsiveModal from "@/shared/ui/responsive/ResponsiveModal";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import { Id } from "convex/_generated/dataModel";
import { ContactValues } from "@/shared/types/types";
import { useInsertContact } from "@/domain/contacts";
import { ContactFields } from "@/features/contacts/components/ContactFields";
import {
  isValidFullName,
  isValidPhoneNumber,
} from "@/shared/utils/frontend-validation";

interface ResponsiveAddContactProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: Id<"users">;
}

const ResponsiveAddContact: React.FC<ResponsiveAddContactProps> = ({
  isOpen,
  onOpenChange,
  userId,
}) => {
  const [values, setValues] = useState<ContactValues>({
    name: "",
    phoneNumber: "",
  });

  const {
    insertContact,
    insertContactLoading,
    insertContactError,
    setInsertContactError,
  } = useInsertContact();

  const resetState = () => {
    setInsertContactError(null);
    setValues({ name: "", phoneNumber: "" });
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleSave = async () => {
    const name = values.name.trim();
    const phoneNumber = values.phoneNumber.trim();

    if (!userId) {
      return;
    }

    const result = await insertContact({
      userId,
      name,
      phoneNumber,
    });

    if (result) {
      handleClose();
    }
  };

  const isDisabled =
    !isValidFullName(values.name) ||
    insertContactLoading ||
    !userId ||
    !isValidPhoneNumber(values.phoneNumber);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={handleClose}
      title="Add Contact"
      description="Enter a name and phone number to add a contact."
    >
      <ContactFields
        values={values}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
      >
        <FormActions
          onCancel={handleClose}
          onSubmit={handleSave}
          isLoading={insertContactLoading}
          submitText="Add"
          error={insertContactError}
          isSubmitDisabled={isDisabled}
        />
      </ContactFields>
    </ResponsiveModal>
  );
};

export default ResponsiveAddContact;
