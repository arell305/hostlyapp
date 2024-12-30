import React, { useState } from "react";
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
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
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
          <DrawerClose className="flex-1">
            <Button variant="ghost" className="w-full" disabled={isLoading}>
              {cancelText}
            </Button>
          </DrawerClose>
          <Button
            variant={confirmVariant}
            onClick={onSubmit}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="animate-spin h-4 w-4" aria-hidden="true" />
                <span>Loading...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default BaseDrawer;
