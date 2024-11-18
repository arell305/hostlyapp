import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // For the loading spinner

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          {/* Cancel Button */}
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            {cancelText}
          </Button>
          {/* Confirm Button with Loading State */}
          <Button
            onClick={handleConfirm}
            variant="destructive"
            disabled={isLoading}
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
      </div>
    </div>
  );
};

export default ConfirmModal;
