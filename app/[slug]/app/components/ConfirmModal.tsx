import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormActions from "@/components/shared/buttonContainers/FormActions";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  isLoading: boolean;
  error: string | null;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant = "default",
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded-xl">
        <DialogHeader className="mb-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <FormActions
          onCancel={onClose}
          onSubmit={onConfirm}
          cancelText={cancelText}
          submitText={confirmText}
          loadingText="Loading"
          isLoading={isLoading}
          error={error}
          cancelVariant="secondary"
          submitVariant={
            confirmVariant as
              | "default"
              | "destructive"
              | "outline"
              | "secondary"
          }
        />
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
