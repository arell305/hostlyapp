"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";
import MenuEdit from "@/shared/ui/buttonContainers/menu/MenuEdit";
import MenuDelete from "@/shared/ui/buttonContainers/menu/MenuDelete";

type Props = {
  event: Doc<"events">;
  onEdit: (event: Doc<"events">) => void;
  onDelete: (id: Id<"events">) => void;
  onClose: () => void;
};

export default function ContactActionMenuContent({
  event,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  return (
    <MenuContainer>
      <MenuEdit doc={event} onEdit={onEdit} onClose={onClose} />

      <MenuDelete doc={event} onDelete={onDelete} onClose={onClose} />
    </MenuContainer>
  );
}
