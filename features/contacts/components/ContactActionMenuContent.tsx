"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";
import MenuEdit from "@/shared/ui/buttonContainers/menu/MenuEdit";
import MenuDelete from "@/shared/ui/buttonContainers/menu/MenuDelete";

type Props = {
  contact: Doc<"contacts">;
  onEdit: (contact: Doc<"contacts">) => void;
  onDelete: (id: Id<"contacts">) => void;
  onClose: () => void;
};

export default function ContactActionMenuContent({
  contact,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  return (
    <MenuContainer>
      <MenuEdit doc={contact} onEdit={onEdit} onClose={onClose} />

      <MenuDelete doc={contact} onDelete={onDelete} onClose={onClose} />
    </MenuContainer>
  );
}
