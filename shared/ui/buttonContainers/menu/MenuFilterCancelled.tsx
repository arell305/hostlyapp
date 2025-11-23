"use client";

import { Ban } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

type MenuFilterCancelledProps<T = unknown> = {
  onClose: () => void;
  onClick: () => void;
};

export default function MenuFilterCancelled({
  onClick,
  onClose,
}: MenuFilterCancelledProps) {
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
      <Ban size={18} />
      Cancelled
    </Button>
  );
}
