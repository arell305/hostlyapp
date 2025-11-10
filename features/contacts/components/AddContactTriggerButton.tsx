"use client";

import { AddButton } from "@/shared/ui/buttonContainers/NewItemButton";

type TriggerButtonProps = {
  onOpenChange: (open: boolean) => void;
};

export default function AddContactTriggerButton({
  onOpenChange,
}: TriggerButtonProps) {
  return <AddButton onClick={() => onOpenChange(true)} label="Contact" />;
}
