"use client";

import { Button } from "../primitive/button";
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type Props = {
  onClick: () => void;
  label: string;
  className?: string;
};

export function AddButton({ onClick, label, className }: Props) {
  return (
    <Button
      size="heading"
      className={cn("gap-1 w-[120px]", className)}
      onClick={onClick}
    >
      <Plus size={20} />
      <span>{label}</span>
    </Button>
  );
}
