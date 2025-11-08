"use client";

import { useEffect } from "react";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@shared/types/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/primitive/dialog";

interface ResponsiveHeightModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  lockBodyScroll?: boolean;
}

const ResponsiveHeightModal: React.FC<ResponsiveHeightModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  lockBodyScroll = true,
}) => {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

  useEffect(() => {
    if (!lockBodyScroll || !isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, lockBodyScroll]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={isDesktop ? "" : "flex flex-col h-[95dvh]"}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default ResponsiveHeightModal;
