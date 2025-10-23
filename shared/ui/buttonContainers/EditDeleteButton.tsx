"use client";

import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { Pencil, Trash, X } from "lucide-react";

interface EditDeleteButtonProps {
  isEditing: boolean;
  onToggle: () => void;
  onCancelEdit?: () => void;
  onDelete?: () => void;
}

const EditDeleteButton: React.FC<EditDeleteButtonProps> = ({
  isEditing,
  onToggle,
  onCancelEdit,
  onDelete,
}) => {
  const handleEditClick = () => {
    if (isEditing && onCancelEdit) {
      return onCancelEdit();
    } else {
      onToggle();
    }
  };

  const handleDeleteClick = () => {
    onDelete?.();
  };

  return (
    <div className="flex gap-2">
      <IconButton
        icon={isEditing ? <X size={20} /> : <Pencil size={20} />}
        onClick={handleEditClick}
        title={isEditing ? "Cancel Edit" : "Edit"}
      />
      <IconButton
        icon={<Trash size={20} />}
        onClick={handleDeleteClick}
        title="Delete"
        disabled={isEditing}
      />
    </div>
  );
};

export default EditDeleteButton;
