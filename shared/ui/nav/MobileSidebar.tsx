"use client";

import { X, Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shared/ui/primitive/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import SidebarContent from "./SidebarContent";
import IconButton from "@shared/ui/buttonContainers/IconButton";

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <IconButton
            icon={isOpen ? <X size={24} /> : <Menu size={24} />}
            variant="ghost"
          />
        </SheetTrigger>

        <SheetContent
          side="left"
          className="h-screen w-full max-w-full p-0 overflow-y-auto z-[999]"
        >
          <SheetHeader>
            <VisuallyHidden>
              <SheetTitle>Sidebar Navigation</SheetTitle>
            </VisuallyHidden>
          </SheetHeader>

          <SidebarContent onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
