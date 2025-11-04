"use client";

import { Button } from "../primitive/button";
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ReactNode } from "react";

type Props = {
  onClick: () => void;
  label: string;
  icon?: ReactNode;
  className?: string;
  variant?: "default" | "secondaryAction";
  size?: "default" | "sm" | "lg" | "icon" | "heading";
};

export function ActionButton({
  onClick,
  label,
  icon,
  className,
  variant = "default",
  size = "heading",
}: Props) {
  return (
    <Button
      size={size}
      variant={variant}
      className={cn("gap-1 w-[120px]", className)}
      onClick={onClick}
    >
      {icon ?? <Plus size={20} />}
      <span>{label}</span>
    </Button>
  );
}
