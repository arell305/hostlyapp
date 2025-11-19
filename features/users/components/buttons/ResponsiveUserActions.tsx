"use client";

import { useState } from "react";
import { EllipsisVertical } from "lucide-react";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@shared/types/constants";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import DesktopActionMenu from "@/shared/ui/dropdown/DesktopActionMenu";
import MobileActionDrawer from "@/shared/ui/drawer/MobileActionDrawer";
import UserActionMenuContent from "./UserActionMenuContent";
import { UserWithPromoCode } from "@/shared/types/types";

type Props = {
  user: UserWithPromoCode;
  onDelete: () => void;
  onReactivate: () => void;
};

export default function ResponsiveCampaignActions({
  user,
  onDelete,
  onReactivate,
}: Props) {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => setOpen(false);

  const menu = (
    <UserActionMenuContent
      user={user}
      onDelete={onDelete}
      onReactivate={onReactivate}
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

  const title = "User actions";
  const description = "Choose an action for this user";

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
