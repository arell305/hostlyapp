"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import { Save, Loader2 } from "lucide-react";
import _ from "lodash";
interface EditableInputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  isEditing: boolean;
  isSaving: boolean;
  error?: string | null;
  type?: "text" | "number"; // <-- NEW
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
  type = "text", // <-- default to text
}) => {
  return (
    <div className="w-full border-b px-4 py-3">
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
              type={type}
              min={type === "number" ? 0 : undefined} // <-- min 0 if number
            />
            <p
              className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
            >
              {error || "Placeholder to maintain height"}
            </p>
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
            disabled={isSaving}
          />
        </div>
      ) : (
        <p className="text-xl font-semibold mt-.5">
          {_.capitalize(value) || "Not Set"}
        </p>
      )}
    </div>
  );
};

export default EditableInputField;
