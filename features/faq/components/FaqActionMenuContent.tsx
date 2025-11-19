"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";
import MenuEdit from "@/shared/ui/buttonContainers/menu/MenuEdit";
import MenuDelete from "@/shared/ui/buttonContainers/menu/MenuDelete";

type Props = {
  faq: Doc<"faq">;
  onEdit: (faq: Doc<"faq">) => void;
  onDelete: (id: Id<"faq">) => void;
  onClose: () => void;
};

export default function ContactActionMenuContent({
  faq,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  return (
    <MenuContainer>
      <MenuEdit doc={faq} onEdit={onEdit} onClose={onClose} />

      <MenuDelete doc={faq} onDelete={onDelete} onClose={onClose} />
    </MenuContainer>
  );
}
