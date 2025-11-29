"use client";

import { useState } from "react";
import { EllipsisVertical } from "lucide-react";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@shared/types/constants";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import DesktopActionMenu from "@/shared/ui/dropdown/DesktopActionMenu";
import MobileActionDrawer from "@/shared/ui/drawer/MobileActionDrawer";
import ContactActionMenuContent from "../EventActionMenuContent";
import { Doc } from "@/convex/_generated/dataModel";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  onAddCampaign: () => void;
  event: Doc<"events">;
  onDelete: (id: Id<"events">) => void;
  onEdit: () => void;
};

export default function ResponsiveAdminMenuContent({
  event,
  onDelete,
  onAddCampaign,
  onEdit,
}: Props) {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => setOpen(false);

  const menu = (
    <ContactActionMenuContent
      event={event}
      onDelete={onDelete}
      onAddCampaign={onAddCampaign}
      onClose={handleClose}
      onEdit={onEdit}
    />
  );

  const trigger = (
    <IconButton icon={<EllipsisVertical />} onClick={() => setOpen(true)} />
  );

  const title = "Admin actions";
  const description = "Select an action for this event";

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
