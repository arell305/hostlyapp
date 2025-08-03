"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import { Save, Loader2 } from "lucide-react";
import _ from "lodash";
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
  disabled?: boolean;
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
  disabled,
}) => {
  return (
    <EditableFieldWrapper className="border-t">
      <Label htmlFor={name} className="font-normal text-grayText ">
        {label}
      </Label>

      {isEditing ? (
        <div className="flex items-start gap-2 mt-1">
          <div className="flex flex-col w-full">
            <Input
              id={name}
              name={name}
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
            disabled={isSaving || disabled}
            title={"Save"}
          />
        </div>
      ) : (
        <FormattedValueDisplay
          value={value}
          fallbackText="Not Set"
          className="text-xl font-semibold mt-.5"
        />
      )}
    </EditableFieldWrapper>
  );
};

export default EditableInputField;
