"use client";

import { Pencil, Trash2 } from "lucide-react";
import ChoiceDrawer from "@/shared/ui/drawer/ChoiceDrawer";
import { Doc, Id } from "@/convex/_generated/dataModel";

type ContactActionSheetProps = {
  contact: Doc<"contacts"> | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (contact: Doc<"contacts">) => void;
  onDelete: (contactId: Id<"contacts">) => void;
};

export default function ContactActionSheet({
  contact,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
}: ContactActionSheetProps) {
  if (!contact) {
    return null;
  }

  return (
    <ChoiceDrawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-1 py-2">
        <button
          onClick={() => {
            if (contact) {
              onEdit(contact);
            }
            onOpenChange(false);
          }}
          className="flex items-center gap-4 px-4 py-3  hover:bg-cardBackgroundHover rounded-md transition-colors"
        >
          <Pencil size={20} />
          <span className="font-medium">Edit</span>
        </button>

        {/* ---- DELETE ---- */}
        <button
          onClick={() => {
            onDelete(contact?._id);
            onOpenChange(false);
          }}
          className="flex items-center gap-4 px-4 py-3 text-destructive hover:bg-cardBackgroundHover rounded-md transition-colors"
        >
          <Trash2 size={20} />
          <span className="font-medium">Delete</span>
        </button>
      </div>
    </ChoiceDrawer>
  );
}
