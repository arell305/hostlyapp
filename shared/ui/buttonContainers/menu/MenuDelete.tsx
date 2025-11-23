"use client";

import { Archive, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

type MenuDeleteProps<T extends { _id: string; name?: string }> = {
  doc: T;
  onDelete: (id: T["_id"]) => void;
  onClose: () => void;
  isArchived?: boolean;
  label?: string;
};

export default function MenuDelete<T extends { _id: string; name?: string }>({
  doc,
  onDelete,
  onClose,
  isArchived = false,
  label,
}: MenuDeleteProps<T>) {
  const title = isArchived ? "Archive" : "Delete";
  const buttonLabel = label ? `${title} ${label}` : title;
  const icon = isArchived ? <Archive size={18} /> : <Trash2 size={18} />;
  return (
    <Button
      variant="menuDestructive"
      size="menu"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(doc._id);
        onClose();
      }}
      aria-label={`${title} ${doc.name ?? ""}`}
    >
      {icon}
      {buttonLabel}
    </Button>
  );
}
