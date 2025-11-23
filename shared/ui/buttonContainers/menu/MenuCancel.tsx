"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/shared/ui/primitive/button";
import { Ban } from "lucide-react";

type MenuCancelProps<T extends { _id: string }> = {
  doc: T;
  onCancel: (id: T["_id"]) => void;
  onClose: () => void;
};

export default function MenuCancel<T extends { _id: string }>({
  doc,
  onCancel,
  onClose,
}: MenuCancelProps<T>) {
  return (
    <Button
      variant="menu"
      size="menu"
      onClick={(e) => {
        e.stopPropagation();
        onCancel(doc._id);
        onClose();
      }}
    >
      <Ban size={18} />
      Cancel
    </Button>
  );
}
