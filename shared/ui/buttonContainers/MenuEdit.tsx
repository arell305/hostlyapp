"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

type MenuEditProps<T = unknown> = {
  doc: T;
  onEdit: (doc: T) => void;
  onClose: () => void;
};

export default function MenuEdit<T = unknown>({
  doc,
  onEdit,
  onClose,
}: MenuEditProps<T>) {
  return (
    <Button
      variant="menu"
      size="menu"
      onClick={() => {
        onEdit(doc);
        onClose();
      }}
    >
      <Pencil size={18} />
      Edit
    </Button>
  );
}
