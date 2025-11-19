"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

type MenuReactivateProps<T extends { _id: string; name?: string }> = {
  doc: T;
  onReactivate: (id: T["_id"]) => void;
  onClose: () => void;
};

export default function MenuDelete<T extends { _id: string; name?: string }>({
  doc,
  onReactivate,
  onClose,
}: MenuReactivateProps<T>) {
  return (
    <Button
      variant="menu"
      size="menu"
      onClick={() => {
        onReactivate(doc._id);
        onClose();
      }}
      aria-label={`Reactivate ${doc.name ?? ""}`}
    >
      <RotateCcw size={18} />
      Reactivate
    </Button>
  );
}
