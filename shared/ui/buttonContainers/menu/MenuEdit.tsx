"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

type MenuEditProps<T = unknown> = {
  doc: T;
  onEdit: (doc: T) => void;
  onClose: () => void;
  label?: string;
};

export default function MenuEdit<T = unknown>({
  doc,
  onEdit,
  onClose,
  label,
}: MenuEditProps<T>) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(doc);
    onClose();
  };

  const buttonLabel = label ? `${label} Edit` : "Edit";

  return (
    <Button
      variant="menu"
      size="menu"
      onClick={handleClick}
      className="w-full justify-start"
    >
      <Pencil size={18} />
      {buttonLabel}
    </Button>
  );
}
