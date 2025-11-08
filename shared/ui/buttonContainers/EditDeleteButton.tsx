"use client";

import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@/shared/types/constants";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { EllipsisVertical, Pencil, Trash, X } from "lucide-react";
import MobileActionDrawer from "../drawer/MobileActionDrawer";
import { useState } from "react";
import EventActionMenuContent from "@/features/events/components/EventActionMenuContent";
import { Doc } from "@/convex/_generated/dataModel";

interface EditDeleteButtonProps {
  isEditing: boolean;
  onToggle: () => void;
  onCancelEdit?: () => void;
  onDelete: () => void;
  event: Doc<"events">;
}

const EditDeleteButton: React.FC<EditDeleteButtonProps> = ({
  isEditing,
  onToggle,
  onCancelEdit,
  onDelete,
  event,
}) => {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const handleEditClick = () => {
    if (isEditing && onCancelEdit) {
      return onCancelEdit();
    } else {
      onToggle();
    }
  };

  const handleDeleteClick = () => {
    onDelete?.();
  };

  if (isDesktop) {
    return (
      <div className="flex gap-2">
        <IconButton
          icon={isEditing ? <X size={20} /> : <Pencil size={20} />}
          onClick={handleEditClick}
          title={isEditing ? "Cancel Edit" : "Edit"}
        />
        <IconButton
          icon={<Trash size={20} />}
          onClick={handleDeleteClick}
          title="Delete"
          disabled={isEditing}
        />
      </div>
    );
  }
  if (isEditing) {
    return (
      <IconButton
        icon={<X size={20} />}
        onClick={onCancelEdit}
        title="Cancel Edit"
      />
    );
  }
  return (
    <MobileActionDrawer
      isOpen={isMenuOpen}
      onOpenChange={setIsMenuOpen}
      title="Add Contact"
      description="Add a contact manually"
      trigger={
        <IconButton
          icon={<EllipsisVertical />}
          onClick={() => setIsMenuOpen(true)}
          variant="ghost"
          title="Edit/Delete Event"
        />
      }
    >
      <EventActionMenuContent
        event={event}
        onEdit={onToggle}
        onDelete={onDelete}
        onClose={() => setIsMenuOpen(false)}
      />
    </MobileActionDrawer>
  );
};

export default EditDeleteButton;
