"use client";

import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

type MenuCampaignProps = {
  onAddCampaign: () => void;
  onClose: () => void;
};

export default function MenuCampaign({
  onAddCampaign,
  onClose,
}: MenuCampaignProps) {
  return (
    <Button
      variant="menu"
      size="menu"
      onClick={(e) => {
        e.stopPropagation();
        onAddCampaign();
        onClose();
      }}
    >
      <Plus size={18} />
      Add Campaign
    </Button>
  );
}
