"use client";

import { X, Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import SidebarContent from "./SidebarContent";
import IconButton from "@/components/shared/buttonContainers/IconButton";
interface MobileSidebarProps {}

const MobileSidebar: React.FC<MobileSidebarProps> = () => {
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
