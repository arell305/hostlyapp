"use client";

import { Archive } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

type MenuFilterArchivedProps = {
  onClose: () => void;
  onClick: () => void;
};

export default function MenuFilterArchived({
  onClick,
  onClose,
}: MenuFilterArchivedProps) {
  return (
    <Button
      variant="menu"
      size="menu"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
        onClose();
      }}
    >
      <Archive size={18} />
      Archived
    </Button>
  );
}
