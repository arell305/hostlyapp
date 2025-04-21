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
import IconButton from "../IconButton";
import SidebarContent from "./SidebarContent";

interface MobileSidebarProps {
  slug: string;
  orgRole: string;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ slug, orgRole }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <IconButton
            icon={isOpen ? <X size={24} /> : <Menu size={24} />}
            variant="ghost"
            iconClassName="text-white"
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

          <SidebarContent
            slug={slug}
            orgRole={orgRole}
            onNavigate={() => setIsOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
