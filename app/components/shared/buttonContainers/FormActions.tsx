import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  cancelText?: string;
  submitText?: string;
  loadingText?: string;
  isSubmitDisabled?: boolean;
  isLoading?: boolean;
  cancelVariant?: "default" | "secondary" | "destructive" | "outline";
  submitVariant?: "default" | "secondary" | "destructive" | "outline";
  error?: string | null;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  cancelText = "Cancel",
  submitText = "Apply",
  loadingText = "Submitting",
  isSubmitDisabled = false,
  isLoading = false,
  cancelVariant = "secondary",
  submitVariant = "default",
  error,
}) => {
  return (
    <div className="">
      <div className="flex justify-center gap-4">
        <Button
          type="button"
          variant={cancelVariant}
          className="w-1/2"
          onClick={onCancel}
          size="modal"
        >
          {cancelText}
        </Button>
        <Button
          type="submit"
          variant={submitVariant}
          className="w-1/2"
          onClick={onSubmit}
          disabled={isSubmitDisabled || isLoading}
          size="modal"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              {loadingText}...
            </>
          ) : (
            submitText
          )}
        </Button>
      </div>
      <p
        className={`text-sm text-center pt-1 ${
          error ? "text-red-500" : "text-transparent"
        }`}
      >
        {error || "Placeholder to maintain height"}
      </p>
    </div>
  );
};

export default FormActions;
