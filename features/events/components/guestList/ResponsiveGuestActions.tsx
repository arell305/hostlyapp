"use client";

import { useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@shared/types/constants";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import DesktopActionMenu from "@/shared/ui/dropdown/DesktopActionMenu";
import MobileActionDrawer from "@/shared/ui/drawer/MobileActionDrawer";
import GuestActionMenuContent from "./GuestActionMenuContent";

type Props = {
  guest: Doc<"guestListEntries">;
  onEdit: (guest: Doc<"guestListEntries">) => void;
  onDelete: (id: Id<"guestListEntries">) => void;
};

export default function ResponsiveGuestActions({
  guest,
  onEdit,
  onDelete,
}: Props) {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => setOpen(false);

  const menu = (
    <GuestActionMenuContent
      guest={guest}
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

  const title = "Guest actions";
  const description = "Edit or delete this guest";

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
