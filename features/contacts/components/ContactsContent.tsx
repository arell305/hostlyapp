"use client";

import { Doc, Id } from "convex/_generated/dataModel";
import { useState } from "react";
import { useUpdateContact } from "@/domain/contacts";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";
import CustomCard from "@/shared/ui/cards/CustomCard";
import ContactCard from "./ContactCard";
import ResponsiveEditContact from "./ResponsiveEditContact";

interface ContactsContentProps {
  contacts: Doc<"contacts">[];
}

const ContactsContent = ({ contacts }: ContactsContentProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [contactIdToDelete, setContactIdToDelete] =
    useState<Id<"contacts"> | null>(null);

  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [contactToEdit, setContactToEdit] = useState<Doc<"contacts"> | null>(
    null
  );

  const {
    updateContact,
    updateContactLoading,
    updateContactError,
    setUpdateContactError,
  } = useUpdateContact();

  const openEdit = (contact: Doc<"contacts">) => {
    setContactToEdit(contact);
    setUpdateContactError(null);
    setShowEdit(true);
  };

  const closeEdit = () => {
    setShowEdit(false);
    setContactToEdit(null);
    setUpdateContactError(null);
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
    <CustomCard>
      {contacts.map((contact) => (
        <ContactCard
          key={contact._id}
          contact={contact}
          onEdit={() => openEdit(contact)}
          onShowDelete={() => showConfirmDeleteModal(contact._id)}
        />
      ))}

      <ResponsiveEditContact
        isOpen={showEdit}
        onOpenChange={(open) => {
          if (!open) {
            closeEdit();
          }
        }}
        contact={contactToEdit}
      />

      <ResponsiveConfirm
        isOpen={showConfirmDelete}
        title="Confirm Deletion"
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        confirmVariant="destructive"
        content={
          "Are you sure you want to delete this contact? This action cannot be undone."
        }
        error={updateContactError}
        isLoading={updateContactLoading}
        modalProps={{
          onClose: handleCloseConfirmDeleteModal,
          onConfirm: handleDelete,
        }}
        drawerProps={{
          onOpenChange: (open: boolean) => {
            if (!open) handleCloseConfirmDeleteModal();
          },
          onSubmit: handleDelete,
        }}
      />
    </CustomCard>
  );
};

export default ContactsContent;
