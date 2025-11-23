"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/shared/ui/primitive/button";
import { Play } from "lucide-react";

type MenuResumeProps = {
  onResume: (id: Id<"campaigns">) => void;
  onClose: () => void;
  doc: Doc<"campaigns">;
};

export default function MenuResume({
  doc,
  onResume,
  onClose,
}: MenuResumeProps) {
  return (
    <Button
      variant="menu"
      size="menu"
      onClick={(e) => {
        e.stopPropagation();
        onResume(doc._id);
        onClose();
      }}
    >
      <Play size={18} />
      Resume
    </Button>
  );
}
