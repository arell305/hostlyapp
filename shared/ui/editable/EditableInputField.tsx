"use client";

import { Input } from "@shared/ui/primitive/input";
import { Label } from "@shared/ui/primitive/label";
import IconButton from "@shared/ui/buttonContainers/IconButton";
import { Save, Loader2 } from "lucide-react";
import EditableFieldWrapper from "../containers/EditableFieldWapper";
import FormattedValueDisplay from "../display/FormattedValueDisplay";
import FieldErrorMessage from "../error/FieldErrorMessage";

interface EditableInputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  isEditing: boolean;
  isSaving: boolean;
  error?: string | null;
  hasChanges: boolean;
}

const EditableInputField: React.FC<EditableInputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onSave,
  isEditing,
  isSaving,
  error,
  hasChanges,
}) => {
  return (
    <EditableFieldWrapper className="border-t">
      <Label htmlFor={name} className="font-normal text-grayText">
        {label}
      </Label>

      {isEditing ? (
        <div className="flex items-start gap-2 mt-1">
          <div className="flex flex-col w-full">
            <Input
              id={name}
              value={value}
              onChange={onChange}
              className={error ? "border-red-500" : ""}
            />
            <FieldErrorMessage error={error} />
          </div>
          <IconButton
            icon={
              isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save size={20} />
              )
            }
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            title={!hasChanges ? "No changes" : "Save"}
            className={!hasChanges ? "opacity-50 cursor-not-allowed" : ""}
          />
        </div>
      ) : (
        <FormattedValueDisplay
          value={value}
          fallbackText="Not Set"
          className="text-xl font-semibold mt-0.5"
        />
      )}
    </EditableFieldWrapper>
  );
};

export default EditableInputField;
