import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  confirmVariant,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-center space-x-10">
          <Button
            onClick={onClose}
            variant="ghost"
            disabled={isLoading}
            className="font-semibold "
          >
            {cancelText}
          </Button>
          <Button
            onClick={async () => {
              await onConfirm();
            }}
            variant={confirmVariant}
            disabled={isLoading}
            className="font-semibold md:w-full"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin h-4 w-4" aria-hidden="true" />
                <span>Loading...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
