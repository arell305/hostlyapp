"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";
import MenuEdit from "@/shared/ui/buttonContainers/menu/MenuEdit";
import MenuDelete from "@/shared/ui/buttonContainers/menu/MenuDelete";
import MenuCampaign from "@/shared/ui/buttonContainers/menu/MenuCampaign";

type Props = {
  event: Doc<"events">;
  onDelete: (id: Id<"events">) => void;
  onClose: () => void;
  onAddCampaign: () => void;
  onEdit: () => void;
};

export default function ContactActionMenuContent({
  event,
  onDelete,
  onClose,
  onAddCampaign,
  onEdit,
}: Props) {
  return (
    <MenuContainer>
      <MenuEdit doc={event} onEdit={onEdit} onClose={onClose} />
      <MenuCampaign onAddCampaign={onAddCampaign} onClose={onClose} />
      <MenuDelete
        doc={event}
        onDelete={onDelete}
        onClose={onClose}
        label="Event"
      />
    </MenuContainer>
  );
}
