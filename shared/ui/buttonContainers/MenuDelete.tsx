"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

type MenuDeleteProps<T extends { _id: string; name?: string }> = {
  doc: T;
  onDelete: (id: T["_id"]) => void;
  onClose: () => void;
};

export default function MenuDelete<T extends { _id: string; name?: string }>({
  doc,
  onDelete,
  onClose,
}: MenuDeleteProps<T>) {
  return (
    <Button
      variant="menuDestructive"
      size="menu"
      onClick={() => {
        onDelete(doc._id);
        onClose();
      }}
      aria-label={`Delete ${doc.name ?? ""}`}
    >
      <Trash2 size={18} />
      Delete
    </Button>
  );
}
