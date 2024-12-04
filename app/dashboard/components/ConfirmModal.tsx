import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // For the loading spinner
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>; // Handles both sync and async actions
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    const result = onConfirm();

    // Check if the result is a Promise
    if (result instanceof Promise) {
      setIsLoading(true);
      try {
        await result; // Await the promise if it's asynchronous
      } finally {
        setIsLoading(false); // Reset loading state
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-6 rounded-lg max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="mb-4">{message}</p>
        <div className="flex justify-center space-x-10">
          {/* Cancel Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            disabled={isLoading}
            className="font-semibold  w-[140px]"
          >
            {cancelText}
          </Button>
          {/* Confirm Button with Loading State */}
          <Button
            onClick={handleConfirm}
            variant="default"
            disabled={isLoading}
            className="bg-altRed rounded-[20px] w-[140px] font-semibold"
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
