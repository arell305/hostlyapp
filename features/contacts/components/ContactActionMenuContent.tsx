import { Pencil, Trash2 } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/shared/ui/primitive/button";
import MenuContainer from "@/shared/ui/buttonContainers/MenuContainer";

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
      <Button
        variant="menu"
        size="menu"
        onClick={() => {
          onEdit(contact);
          onClose();
        }}
      >
        <Pencil size={18} />
        Edit
      </Button>

      <Button
        variant="menuDestructive"
        size="menu"
        onClick={() => {
          onDelete(contact._id);
          onClose();
        }}
        aria-label={`Delete contact ${contact.name}`}
      >
        <Trash2 size={18} />
        Delete
      </Button>
    </MenuContainer>
  );
}
