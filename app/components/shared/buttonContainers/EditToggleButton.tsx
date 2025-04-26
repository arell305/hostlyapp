"use client";

import IconButton from "@/components/shared/buttonContainers/IconButton";
import { Pencil, X } from "lucide-react";

interface EditToggleButtonProps {
  isEditing: boolean;
  onToggle: () => void;
}

const EditToggleButton: React.FC<EditToggleButtonProps> = ({
  isEditing,
  onToggle,
}) => {
  return (
    <IconButton
      icon={isEditing ? <X size={20} /> : <Pencil size={20} />}
      onClick={onToggle}
    />
  );
};

export default EditToggleButton;
