"use client";

import { useState } from "react";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@/shared/types/constants";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { EllipsisVertical, Pencil, Trash, X } from "lucide-react";
import MobileActionDrawer from "../drawer/MobileActionDrawer";
import { Doc, TableNames } from "@/convex/_generated/dataModel";

type GenericDoc = Doc<TableNames>;

interface GenericEditDeleteButtonProps<T extends GenericDoc> {
  doc: T;
  isEditing: boolean;
  onToggleEdit: () => void;
  onCancelEdit?: () => void;
  onDelete: () => void;
  entityName: string;
  renderMobileMenu: (props: {
    onEdit: () => void;
    onDelete: () => void;
    onClose: () => void;
  }) => React.ReactNode;
}

function GenericEditDeleteButton<T extends GenericDoc>({
  doc,
  isEditing,
  onToggleEdit,
  onCancelEdit,
  onDelete,
  entityName,
  renderMobileMenu,
}: GenericEditDeleteButtonProps<T>) {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleEditClick = () => {
    if (isEditing && onCancelEdit) {
      onCancelEdit();
    } else {
      onToggleEdit();
    }
  };

  if (isDesktop) {
    return (
      <div className="flex gap-2">
        <IconButton
          icon={isEditing ? <X size={20} /> : <Pencil size={20} />}
          onClick={handleEditClick}
          title={isEditing ? `Cancel ${entityName}` : `${entityName}`}
        />
        <IconButton
          icon={<Trash size={20} />}
          onClick={onDelete}
          title={`Delete ${entityName}`}
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
        title={`Cancel ${entityName}`}
      />
    );
  }

  return (
    <MobileActionDrawer
      description={`Edit/Delete ${entityName}`}
      isOpen={drawerOpen}
      onOpenChange={setDrawerOpen}
      title={`Edit/Delete ${entityName}`}
      trigger={
        <IconButton
          icon={<EllipsisVertical />}
          onClick={() => setDrawerOpen(true)}
          variant="ghost"
          title={`Edit/Delete ${entityName}`}
        />
      }
    >
      {renderMobileMenu({
        onEdit: onToggleEdit,
        onDelete,
        onClose: () => setDrawerOpen(false),
      })}
    </MobileActionDrawer>
  );
}

export default GenericEditDeleteButton;
