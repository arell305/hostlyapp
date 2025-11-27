"use client";

import { StopCircle } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

type MenuStopProps<T extends { _id: string; name?: string }> = {
  doc: T;
  onStop: (id: T["_id"]) => void;
  onClose: () => void;
  label?: string;
};

export default function MenuStop<T extends { _id: string; name?: string }>({
  doc,
  onStop,
  onClose,
}: MenuStopProps<T>) {
  return (
    <Button
      variant="menuDestructive"
      size="menu"
      onClick={(e) => {
        e.stopPropagation();
        onStop(doc._id);
        onClose();
      }}
      aria-label={`Stop AI Replies for campaign ${doc.name ?? ""}`}
    >
      <StopCircle size={18} />
      Stop Replies
    </Button>
  );
}
