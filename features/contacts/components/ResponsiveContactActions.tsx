"use client";

import { useState } from "react";
import { EllipsisVertical } from "lucide-react";
import ContactActionMenuContent from "./ContactActionMenuContent";
import { Doc, Id } from "@/convex/_generated/dataModel";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@shared/types/constants";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import DesktopActionMenu from "@/shared/ui/dropdown/DesktopActionMenu";
import MobileActionDrawer from "@/shared/ui/drawer/MobileActionDrawer";

type Props = {
  contact: Doc<"contacts">;
  onEdit: (c: Doc<"contacts">) => void;
  onDelete: (id: Id<"contacts">) => void;
};

export default function ResponsiveContactActions({
  contact,
  onEdit,
  onDelete,
}: Props) {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => setOpen(false);

  const menu = (
    <ContactActionMenuContent
      contact={contact}
      onEdit={onEdit}
      onDelete={onDelete}
      onClose={handleClose}
    />
  );

  const trigger = (
    <IconButton
      icon={<EllipsisVertical />}
      onClick={() => setOpen(true)}
      variant="ghost"
    />
  );

  const title = "Contact actions";
  const description = "Edit or delete this contact";

  if (isDesktop) {
    return (
      <DesktopActionMenu
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        children={menu}
      />
    );
  }

  return (
    <MobileActionDrawer
      isOpen={open}
      onOpenChange={setOpen}
      title={title}
      description={description}
      trigger={trigger}
      children={menu}
    />
  );
}
