"use client";

import IconButton from "@/components/shared/buttonContainers/IconButton";
import { Pencil, X } from "lucide-react";

interface EditButtonProps {
  isEditing: boolean;
  onToggle: () => void;
  onCancelEdit?: () => void; // Optional: triggered when exiting edit mode
}

const EditButton: React.FC<EditButtonProps> = ({
  isEditing,
  onToggle,
  onCancelEdit,
}) => {
  const handleClick = () => {
    if (isEditing && onCancelEdit) {
      onCancelEdit();
    } else {
      onToggle();
    }
  };

  return (
    <IconButton
      icon={isEditing ? <X size={20} /> : <Pencil size={20} />}
      onClick={handleClick}
      title={isEditing ? "Cancel Edit" : "Edit"}
    />
  );
};

export default EditButton;
