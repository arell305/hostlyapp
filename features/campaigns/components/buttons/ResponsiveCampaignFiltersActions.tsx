"use client";

import { useState } from "react";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@shared/types/constants";
import DesktopActionMenu from "@/shared/ui/dropdown/DesktopActionMenu";
import MobileActionDrawer from "@/shared/ui/drawer/MobileActionDrawer";
import CampaignFiltersActionMenuContent from "./CampaignFIltersActionMenuContent";
import SingleTabButton from "@/shared/ui/toggle/SingleTabButton";
import { CampaignFilterStatus } from "@/shared/types/types";

type Props = {
  onAction: (action: CampaignFilterStatus) => void;
  campaignStatus: CampaignFilterStatus;
};

export default function ResponsiveCampaignActions({
  onAction,
  campaignStatus,
}: Props) {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => setOpen(false);

  const menu = (
    <CampaignFiltersActionMenuContent
      onAction={onAction}
      onClose={handleClose}
    />
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const getButtonLabel = (status: CampaignFilterStatus): string => {
    switch (status) {
      case "Failed":
        return "Failed";
      case "Cancelled":
        return "Cancelled";
      case "Archived":
        return "Archived";
      default:
        return "More";
    }
  };

  const buttonLabel = getButtonLabel(campaignStatus);

  const isActive =
    campaignStatus === "Failed" ||
    campaignStatus === "Cancelled" ||
    campaignStatus === "Archived";

  const trigger = (
    <SingleTabButton
      buttonLabel={buttonLabel}
      onClick={handleOpen}
      isActive={isActive}
    />
  );

  const title = "Campaign filter actions";
  const description = "Choose a filter for this campaign";

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
