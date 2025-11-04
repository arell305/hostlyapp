"use client";

import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { Pencil, Trash } from "lucide-react";

interface EditDeleteIconsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const EditDeleteIcons: React.FC<EditDeleteIconsProps> = ({
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex gap-2">
      <IconButton icon={<Pencil size={20} />} onClick={onEdit} title="Edit" />
      <IconButton
        icon={<Trash size={20} />}
        onClick={onDelete}
        title="Delete"
      />
    </div>
  );
};

export default EditDeleteIcons;
