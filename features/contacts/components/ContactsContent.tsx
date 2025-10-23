"use client";

import { Doc, Id } from "convex/_generated/dataModel";
import { useState } from "react";
import ContactCard from "./ContactCard";
import { useUpdateContact } from "@/domain/contacts";
import { ContactValues } from "@/shared/types/types";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";

interface ContactsContentProps {
  contacts: Doc<"contacts">[];
}

const ContactsContent = ({ contacts }: ContactsContentProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [contactIdToDelete, setContactIdToDelete] =
    useState<Id<"contacts"> | null>(null);

  const {
    updateContact,
    updateContactLoading,
    updateContactError,
    setUpdateContactError,
  } = useUpdateContact();

  const handleSave = async (
    contactId: Doc<"contacts">["_id"],
    update: ContactValues
  ) => {
    const result = await updateContact({
      contactId,
      updates: { ...update },
    });
    return result;
  };

  const showConfirmDeleteModal = (contactId: Doc<"contacts">["_id"]) => {
    setContactIdToDelete(contactId);
    setShowConfirmDelete(true);
    setUpdateContactError(null);
  };

  const handleCloseConfirmDeleteModal = () => {
    setShowConfirmDelete(false);
    setContactIdToDelete(null);
    setUpdateContactError(null);
  };

  const handleDelete = async (): Promise<void> => {
    if (!contactIdToDelete) {
      return;
    }
    const result = await updateContact({
      contactId: contactIdToDelete,
      updates: { isActive: false },
    });
    if (result) {
      handleCloseConfirmDeleteModal();
    }
  };

  return (
    <div>
      {contacts.map((contact) => (
        <ContactCard
          key={contact._id}
          contact={contact}
          onSave={handleSave}
          onDelete={showConfirmDeleteModal}
          isLoading={updateContactLoading}
          error={updateContactError}
        />
      ))}
      <ResponsiveConfirm
        isOpen={showConfirmDelete}
        title="Confirm Deletion"
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        confirmVariant="destructive"
        content={
          "Are you sure you want to delete this FAQ? This action cannot be undone."
        }
        error={updateContactError}
        isLoading={updateContactLoading}
        modalProps={{
          onClose: handleCloseConfirmDeleteModal,
          onConfirm: handleDelete,
        }}
      />
    </div>
  );
};

export default ContactsContent;
