"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";
import MenuEdit from "@/shared/ui/buttonContainers/menu/MenuEdit";
import MenuDelete from "@/shared/ui/buttonContainers/menu/MenuDelete";
import MenuCancel from "@/shared/ui/buttonContainers/menu/MenuCancel";

type Props = {
  campaign: Doc<"campaigns">;
  onEdit: (campaign: Doc<"campaigns">) => void;
  onDelete: (id: Id<"campaigns">) => void;
  onCancel: (id: Id<"campaigns">) => void;
  onClose: () => void;
};

export default function CampaignActionMenuContent({
  campaign,
  onEdit,
  onDelete,
  onCancel,
  onClose,
}: Props) {
  return (
    <MenuContainer>
      <MenuEdit doc={campaign} onEdit={onEdit} onClose={onClose} />
      {campaign.status === "Scheduled" && (
        <MenuCancel doc={campaign} onCancel={onCancel} onClose={onClose} />
      )}
      <MenuDelete doc={campaign} onDelete={onDelete} onClose={onClose} />
    </MenuContainer>
  );
}
