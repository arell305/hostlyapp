import { InlineEditActions } from "@/components/shared/buttonContainers/InlineEditActions";
import CustomCard from "@/components/shared/cards/CustomCard";
import { ContactValues } from "@/types/types";
import { Doc, Id } from "convex/_generated/dataModel";
import React, { useState } from "react";

interface ContactCardProps {
  contact: Doc<"contacts">;
  onSave: (
    contactId: Id<"contacts">,
    update: ContactValues
  ) => Promise<boolean | void>;
  onDelete: (contactId: Id<"contacts">) => void;
  isLoading: boolean;
  error?: string | null;
}
const ContactCard = ({
  contact,
  onSave,
  onDelete,
  isLoading,
  error,
}: ContactCardProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(contact.name);
  const [phoneNumber, setPhoneNumber] = useState<string>(
    contact.phoneNumber || ""
  );

  const canSave = name.trim().length > 0 && phoneNumber.trim().length > 0;

  const startEdit = () => setIsEditing(true);
  const cancelEdit = () => setIsEditing(false);

  const handleSave = async () => {
    if (!onSave || !canSave) {
      return;
    }

    const ok = await onSave(contact._id, { name, phoneNumber });
    if (ok) {
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(contact._id);
    }
  };
  return (
    <CustomCard>
      <InlineEditActions
        isEditing={isEditing}
        canSave={canSave}
        isSaving={isLoading}
        onEdit={startEdit}
        onCancel={cancelEdit}
        onSave={handleSave}
        onDelete={handleDelete}
        showEditButton={true}
      />
      <h1>{contact.name}</h1>
      <p>{contact.phoneNumber}</p>
    </CustomCard>
  );
};

export default ContactCard;
