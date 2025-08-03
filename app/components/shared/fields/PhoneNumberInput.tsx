import React from "react";
import { PatternFormat } from "react-number-format";
import { Label } from "@/components/ui/label";
import { formatPhoneNumber } from "@/utils/format";
import FieldErrorMessage from "../error/FieldErrorMessage";

interface PhoneNumberInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  placeholder?: string;
  isEditing?: boolean;
  name: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder = "(123) 456-7890",
  isEditing = false,
  name,
}) => {
  return (
    <div>
      {label && (
        <Label htmlFor={name} className="block text-sm font-medium">
          {label}
        </Label>
      )}
      <PatternFormat
        format="(###) ###-####"
        mask="_"
        value={value}
        onValueChange={(values) => {
          onChange(values.value); // only digits
        }}
        placeholder={placeholder}
        className={`w-full rounded-md border bg-transparent px-2 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent md:file:text-sm file:font-medium file:text-foreground placeholder:text-grayCustom2 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-white ${
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-grayCustom focus-visible:ring-ring"
        }`}
      />
      <FieldErrorMessage error={error} />
    </div>
  );
};

export default PhoneNumberInput;
