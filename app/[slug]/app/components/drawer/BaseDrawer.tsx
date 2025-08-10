import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export interface BaseDrawerProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  onSubmit: () => void | Promise<void>;
  confirmText: string;
  cancelText: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  error: string | null;
}

const BaseDrawer: React.FC<BaseDrawerProps> = ({
  title,
  description,
  children,
  onSubmit,
  confirmText,
  cancelText,
  isOpen,
  onOpenChange,
  confirmVariant = "default",
  isLoading,
  error,
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
      handleResize(); // Initial call in case the keyboard is already open
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
        <DrawerHeader>
          <DrawerTitle className="mb-2">{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        {children}
        <p
          className={`pl-4 text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
        >
          {error || "Placeholder to maintain height"}
        </p>{" "}
        <DrawerFooter className="flex flex-row gap-2 mb-6 mt-2">
          <DrawerClose asChild className="flex-1">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          </DrawerClose>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onSubmit}
            className="flex-1"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default BaseDrawer;
