"use client";

import { AlertTriangle, Ban } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

type MenuFilterFailedProps = {
  onClose: () => void;
  onClick: () => void;
};

export default function MenuFilterFailed({
  onClick,
  onClose,
}: MenuFilterFailedProps) {
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
      <AlertTriangle size={18} />
      Failed
    </Button>
  );
}
