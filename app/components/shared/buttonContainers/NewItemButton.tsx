// components/shared/actions/AddButton.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
