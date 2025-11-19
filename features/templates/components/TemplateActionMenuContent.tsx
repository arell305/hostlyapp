"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";
import MenuEdit from "@/shared/ui/buttonContainers/menu/MenuEdit";
import MenuDelete from "@/shared/ui/buttonContainers/menu/MenuDelete";

type Props = {
  template: Doc<"smsTemplates">;
  onEdit: (template: Doc<"smsTemplates">) => void;
  onDelete: (id: Id<"smsTemplates">) => void;
  onClose: () => void;
};

export default function ContactActionMenuContent({
  template,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  return (
    <MenuContainer>
      <MenuEdit doc={template} onEdit={onEdit} onClose={onClose} />

      <MenuDelete doc={template} onDelete={onDelete} onClose={onClose} />
    </MenuContainer>
  );
}
