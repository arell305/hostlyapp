"use client";

import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { Pencil, X, Check, Trash } from "lucide-react";
import IconButtonsContainer from "../containers/IconButtonsContainer";

export type InlineEditActionsProps = {
  isEditing: boolean;
  canSave: boolean;
  isSaving?: boolean;
  showEditButton?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  className?: string;
};

export function InlineEditActions({
  isEditing,
  canSave,
  isSaving = false,
  showEditButton = false,
  onDelete,
  onEdit,
  onCancel,
  onSave,
  className,
}: InlineEditActionsProps) {
  return (
    <div className={className}>
      {isEditing ? (
        <IconButtonsContainer>
          <IconButton
            icon={<X className="h-4 w-4" />}
            variant="ghost"
            onClick={onCancel}
            title="Cancel"
            aria-label="Cancel"
            disabled={isSaving}
          ></IconButton>
          <IconButton
            icon={<Check className="h-4 w-4" />}
            onClick={onSave}
            title="Save"
            aria-label="Save"
            className="bg-primaryBlue"
            disabled={!canSave || isSaving}
          ></IconButton>
        </IconButtonsContainer>
      ) : (
        showEditButton && (
          <IconButtonsContainer>
            <IconButton
              icon={<Trash className="h-4 w-4" />}
              type="button"
              onClick={onDelete}
              aria-label="Delete"
              title="Delete"
            />
            <IconButton
              icon={<Pencil className="h-4 w-4" />}
              type="button"
              onClick={onEdit}
              aria-label="Edit"
              title="Edit"
            />
          </IconButtonsContainer>
        )
      )}
    </div>
  );
}
