"use client";

import { useEffect, useState } from "react";
import ResponsiveModal from "@/shared/ui/responsive/ResponsiveModal";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import { Doc } from "convex/_generated/dataModel";
import { ContactValues } from "@/shared/types/types";
import { useUpdateContact } from "@/domain/contacts";
import { ContactFields } from "@/features/contacts/components/ContactFields";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Doc<"contacts"> | null;
};

const ResponsiveEditContact: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  contact,
}) => {
  const [values, setValues] = useState<ContactValues>({
    name: "",
    phoneNumber: "",
  });

  const {
    updateContact,
    updateContactLoading,
    updateContactError,
    setUpdateContactError,
  } = useUpdateContact();

  useEffect(() => {
    if (contact) {
      setValues({
        name: contact.name || "",
        phoneNumber: contact.phoneNumber || "",
      });
    }
  }, [contact]);

  const resetState = () => {
    setUpdateContactError(null);
    setValues({ name: "", phoneNumber: "" });
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!contact?._id) {
      return;
    }
    const name = values.name.trim();
    const phoneNumber = values.phoneNumber.trim();
    const result = await updateContact({
      contactId: contact._id,
      updates: { name, phoneNumber },
    });
    if (result) {
      handleClose();
    }
  };

  const isDisabled =
    !values.name.trim() ||
    !values.phoneNumber.trim() ||
    updateContactLoading ||
    !contact?._id;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={handleClose}
      title="Edit Contact"
      description="Update the name and phone number for this contact."
    >
      <ContactFields
        values={values}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
      >
        <FormActions
          onCancel={handleClose}
          onSubmit={handleSave}
          isLoading={updateContactLoading}
          submitText="Save"
          error={updateContactError}
          isSubmitDisabled={isDisabled}
        />
      </ContactFields>
    </ResponsiveModal>
  );
};

export default ResponsiveEditContact;
