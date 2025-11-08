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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/shared/ui/primitive/drawer";

interface ResponsiveModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  lockBodyScroll?: boolean;
}

const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
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

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[100svh] flex flex-col overscroll-contain">
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
        {children}
      </DrawerContent>
    </Drawer>
  );
};

export default ResponsiveModal;

// "use client";
// import React from "react";
// import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
// import { DESKTOP_WIDTH } from "@shared/types/constants";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogTitle,
// } from "@/shared/ui/primitive/dialog";

// interface ResponsiveModalProps {
//   isOpen: boolean;
//   onOpenChange: (open: boolean) => void;
//   title: string;
//   description: React.ReactNode;
//   children: React.ReactNode;
//   lockBodyScroll?: boolean;
// }

// const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
//   isOpen,
//   onOpenChange,
//   title,
//   description,
//   children,
//   lockBodyScroll = true,
// }) => {
//   const isDesktop = useMediaQuery(DESKTOP_WIDTH);

//   // Lock body scroll only when modal is open and locking is desired
//   React.useEffect(() => {
//     if (!lockBodyScroll || !isOpen) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, [isOpen, lockBodyScroll]);

//   return (
//     <Dialog open={isOpen} onOpenChange={onOpenChange}>
//       <DialogContent
//         className={
//           isDesktop
//             ? "fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] border bg-backgroundBlack p-6 shadow-lg rounded-lg w-[90vw] max-w-2xl"
//             : "fixed inset-0 z-50 bg-backgroundBlack p-4 overflow-auto"
//         }
//       >
//         <DialogTitle>{title}</DialogTitle>
//         <DialogDescription>{description}</DialogDescription>
//         {children}
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ResponsiveModal;
