"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/shared/ui/primitive/dropdown-menu";
import { ReactNode } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  menuWidth?: string;
  menuPadding?: string;
};

export default function DesktopActionMenu({
  open,
  onOpenChange,
  trigger,
  children,
  menuWidth = "w-48",
  menuPadding = "p-1",
}: Props) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`${menuWidth} ${menuPadding}`}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
