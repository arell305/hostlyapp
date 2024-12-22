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
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
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
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const result = onSubmit();
    if (result instanceof Promise) {
      setIsLoading(true);
      try {
        await result;
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerTrigger asChild>
          <Button style={{ display: "none" }} />
        </DrawerTrigger>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        {children}
        <DrawerFooter className="flex flex-row gap-0">
          <DrawerClose className="flex-1">
            <Button variant="ghost" className="w-full" disabled={isLoading}>
              {cancelText}
            </Button>
          </DrawerClose>
          <Button
            variant={confirmVariant}
            onClick={handleSubmit}
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
