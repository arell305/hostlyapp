import React from "react";
import { PatternFormat } from "react-number-format";
import { Label } from "@/components/ui/label";
import FieldErrorMessage from "../error/FieldErrorMessage";
import { Input } from "@/components/ui/input";

interface PhoneNumberInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  placeholder?: string;
  name: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder = "(123) 456-7890",
  name,
}) => {
  return (
    <div>
      {label && <Label htmlFor={name}>{label}</Label>}

      <PatternFormat
        format="(###) ###-####"
        mask="_"
        value={value}
        onValueChange={({ value: raw }) => onChange(raw)} // digits only
        placeholder={placeholder}
        customInput={Input}
        error={error} // <-- pass error prop to keep border red
        id={name}
        name={name}
      />

      <FieldErrorMessage error={error} />
    </div>
  );
};

export default PhoneNumberInput;
