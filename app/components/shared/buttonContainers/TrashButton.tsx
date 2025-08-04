"use client";

import IconButton from "@/components/shared/buttonContainers/IconButton";
import { Trash } from "lucide-react";

interface TrashButtonProps {
  onDelete: () => void;
}

const TrashButton: React.FC<TrashButtonProps> = ({ onDelete }) => {
  return (
    <IconButton icon={<Trash size={20} />} onClick={onDelete} title="Delete" />
  );
};

export default TrashButton;
