"use client";

import { useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@shared/types/constants";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import DesktopActionMenu from "@/shared/ui/dropdown/DesktopActionMenu";
import MobileActionDrawer from "@/shared/ui/drawer/MobileActionDrawer";
import CampaignActionMenuContent from "./CampaignActionMenuContent";

type Props = {
  campaign: Doc<"campaigns">;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onReactivate: () => void;
  onResume: () => void;
  onOpenEvent: () => void;
};

export default function ResponsiveCampaignCardActions({
  campaign,
  onEdit,
  onDelete,
  onCancel,
  onReactivate,
  onResume,
  onOpenEvent,
}: Props) {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => setOpen(false);

  const menu = (
    <CampaignActionMenuContent
      campaign={campaign}
      onEdit={onEdit}
      onDelete={onDelete}
      onCancel={onCancel}
      onClose={handleClose}
      onReactivate={onReactivate}
      onResume={onResume}
      onOpenEvent={onOpenEvent}
    />
  );

  const trigger = (
    <IconButton
      icon={<EllipsisVertical />}
      onClick={() => setOpen(true)}
      variant="ghost"
    />
  );

  const title = "Campaign actions";
  const description = "Choose an action for this campaign";

  if (isDesktop) {
    return (
      <DesktopActionMenu open={open} onOpenChange={setOpen} trigger={trigger}>
        {menu}
      </DesktopActionMenu>
    );
  }
  return (
    <MobileActionDrawer
      isOpen={open}
      onOpenChange={setOpen}
      title={title}
      description={description}
      trigger={trigger}
    >
      {menu}
    </MobileActionDrawer>
  );
}
