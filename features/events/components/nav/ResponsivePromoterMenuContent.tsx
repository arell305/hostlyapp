"use client";

import { useState } from "react";
import { EllipsisVertical } from "lucide-react";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@shared/types/constants";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import DesktopActionMenu from "@/shared/ui/dropdown/DesktopActionMenu";
import MobileActionDrawer from "@/shared/ui/drawer/MobileActionDrawer";
import EventPromoterMenuContent from "../../EventPromoterMenuContent";

type Props = {
  onAddCampaign: () => void;
};

export default function ResponsiveGuestActions({ onAddCampaign }: Props) {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => setOpen(false);

  const menu = (
    <EventPromoterMenuContent
      onAddCampaign={onAddCampaign}
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

  const title = "Promoter actions";
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
