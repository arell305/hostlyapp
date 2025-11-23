"use client";

import MenuCampaign from "@/shared/ui/buttonContainers/menu/MenuCampaign";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";

type Props = {
  onClose: () => void;
  onAddCampaign: () => void;
};

export default function EventPromoterMenuContent({
  onAddCampaign,
  onClose,
}: Props) {
  return (
    <MenuContainer>
      <MenuCampaign onAddCampaign={onAddCampaign} onClose={onClose} />
    </MenuContainer>
  );
}
