"use client";

import { CampaignFilterStatus } from "@/shared/types/types";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";
import MenuFilterArchived from "@/shared/ui/buttonContainers/menu/MenuFilterArchived";
import MenuFilterCancelled from "@/shared/ui/buttonContainers/menu/MenuFilterCancelled";
import MenuFilterFailed from "@/shared/ui/buttonContainers/menu/MenuFilterFailed";

type Props = {
  onAction: (action: CampaignFilterStatus) => void;
  onClose: () => void;
};

export default function CampaignFiltersActionMenuContent({
  onAction,
  onClose,
}: Props) {
  return (
    <MenuContainer>
      <MenuFilterArchived
        onClick={() => onAction("Archived")}
        onClose={onClose}
      />
      <MenuFilterCancelled
        onClick={() => onAction("Cancelled")}
        onClose={onClose}
      />
      <MenuFilterFailed onClick={() => onAction("Failed")} onClose={onClose} />
    </MenuContainer>
  );
}
