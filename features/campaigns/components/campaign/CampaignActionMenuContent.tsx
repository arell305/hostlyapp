"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import MenuContainer from "@/shared/ui/buttonContainers/MenuContainer";
import MenuEdit from "@/shared/ui/buttonContainers/MenuEdit";
import MenuDelete from "@/shared/ui/buttonContainers/MenuDelete";

type Props = {
  campaign: Doc<"campaigns">;
  onEdit: (campaign: Doc<"campaigns">) => void;
  onDelete: (id: Id<"campaigns">) => void;
  onClose: () => void;
};

export default function CampaignActionMenuContent({
  campaign,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  return (
    <MenuContainer>
      <MenuEdit doc={campaign} onEdit={onEdit} onClose={onClose} />

      <MenuDelete doc={campaign} onDelete={onDelete} onClose={onClose} />
    </MenuContainer>
  );
}
