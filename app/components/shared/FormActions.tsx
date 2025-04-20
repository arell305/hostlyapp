import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  cancelText?: string;
  submitText?: string;
  isSubmitDisabled?: boolean;
  cancelVariant?: "default" | "secondary" | "destructive" | "outline";
  submitVariant?: "default" | "secondary" | "destructive" | "outline";
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  cancelText = "Cancel",
  submitText = "Apply",
  isSubmitDisabled = false,
  cancelVariant = "secondary",
  submitVariant = "default",
}) => {
  return (
    <div className="flex justify-center gap-4 mt-6">
      <Button
        type="button"
        variant={cancelVariant}
        className="w-1/2"
        onClick={onCancel}
      >
        {cancelText}
      </Button>
      <Button
        type="submit"
        variant={submitVariant}
        className="w-1/2"
        onClick={onSubmit}
        disabled={isSubmitDisabled}
      >
        {submitText}
      </Button>
    </div>
  );
};

export default FormActions;
