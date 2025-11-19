"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";
import MenuEdit from "@/shared/ui/buttonContainers/menu/MenuEdit";
import MenuDelete from "@/shared/ui/buttonContainers/menu/MenuDelete";

type Props = {
  guest: Doc<"guestListEntries">;
  onEdit: (guest: Doc<"guestListEntries">) => void;
  onDelete: (id: Id<"guestListEntries">) => void;
  onClose: () => void;
};

export default function ContactActionMenuContent({
  guest,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  return (
    <MenuContainer>
      <MenuEdit doc={guest} onEdit={onEdit} onClose={onClose} />
      <MenuDelete doc={guest} onDelete={onDelete} onClose={onClose} />
    </MenuContainer>
  );
}
