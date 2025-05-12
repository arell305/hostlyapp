"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import { Save, Loader2 } from "lucide-react";

interface EditableSelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  onSave: () => void;
  isEditing: boolean;
  isSaving: boolean;
  error?: string | null;
}

const EditableSelectField: React.FC<EditableSelectFieldProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  onSave,
  isEditing,
  isSaving,
  error,
}) => {
  return (
    <div className="w-full border-b px-4 py-3">
      <Label htmlFor={name} className="font-normal text-grayText">
        {label}
      </Label>

      {isEditing ? (
        <div className="flex items-start gap-2 mt-1">
          <div className="flex flex-col w-full">
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p
              className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
            >
              {error}
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
          {options.find((opt) => opt.value === value)?.label || "Not Set"}
        </p>
      )}
    </div>
  );
};

export default EditableSelectField;
