"use client";

import { ReactNode } from "react";
import ChoiceDrawer from "@/shared/ui/drawer/ChoiceDrawer";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  trigger: ReactNode;
  children: ReactNode;
};

export default function MobileActionDrawer({
  isOpen,
  onOpenChange,
  title,
  description,
  trigger,
  children,
}: Props) {
  return (
    <>
      {trigger}
      <ChoiceDrawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
      >
        {children}
      </ChoiceDrawer>
    </>
  );
}
