"use client";

import IconButton from "@/components/shared/buttonContainers/IconButton";
import { Pencil, X } from "lucide-react";

interface EditToggleButtonProps {
  isEditing: boolean;
  onToggle: () => void;
  onCancelEdit?: () => void; // <-- make it optional
}

const EditToggleButton: React.FC<EditToggleButtonProps> = ({
  isEditing,
  onToggle,
  onCancelEdit,
}) => {
  const handleClick = () => {
    if (isEditing && onCancelEdit) {
      return onCancelEdit(); // Call cancel first if exiting edit mode
    }
    onToggle(); // Then toggle
  };

  return (
    <IconButton
      icon={isEditing ? <X size={20} /> : <Pencil size={20} />}
      onClick={handleClick}
    />
  );
};

export default EditToggleButton;
