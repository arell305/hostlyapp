"use client";

import { useEffect, useRef } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  DrawerDescription,
} from "@/shared/ui/primitive/drawer";
import { Button } from "@/shared/ui/primitive/button";

export interface ChoiceDrawerProps {
  children?: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const ChoiceDrawer: React.FC<ChoiceDrawerProps> = ({
  children,
  isOpen,
  onOpenChange,
  title = "Actions",
  description = "Choose an action for this item",
}) => {
  const formContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (formContainerRef.current) {
        formContainerRef.current.style.setProperty(
          "bottom",
          `env(safe-area-inset-bottom)`
        );
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      handleResize();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent ref={formContainerRef} className="">
        <DrawerTrigger asChild>
          <Button style={{ display: "none" }} />
        </DrawerTrigger>

        <DrawerTitle className="sr-only">{title}</DrawerTitle>
        <DrawerDescription className="sr-only">{description}</DrawerDescription>

        {children}
      </DrawerContent>
    </Drawer>
  );
};

export default ChoiceDrawer;
