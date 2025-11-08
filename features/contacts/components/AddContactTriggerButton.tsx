"use client";

import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { Plus } from "lucide-react";

type TriggerButtonProps = {
  onOpenChange: (open: boolean) => void;
};

export default function AddContactTriggerButton({
  onOpenChange,
}: TriggerButtonProps) {
  return (
    <IconButton
      icon={<Plus />}
      onClick={() => onOpenChange(true)}
      aria-label="Add Contact"
      variant="primary"
    />
  );
}
