import React from "react";
import { Button } from "@/components/ui/button";
import FieldErrorMessage from "../error/FieldErrorMessage";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  cancelText?: string;
  submitText?: string;
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
          isLoading={isLoading}
        >
          {submitText}
        </Button>
      </div>
      <FieldErrorMessage error={error} />
    </div>
  );
};

export default FormActions;
