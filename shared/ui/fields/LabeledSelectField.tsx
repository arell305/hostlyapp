"use client";

import { Label } from "@shared/ui/primitive/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/primitive/select";
import FieldErrorMessage from "../error/FieldErrorMessage";
import LabelWrapper from "./LabelWrapper";

interface LabeledSelectFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  className?: string;
}

const LabeledSelectField: React.FC<LabeledSelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  className = "",
}) => {
  return (
    <div>
      <LabelWrapper>
        <Label>{label}</Label>
        <Select onValueChange={onChange} value={value}>
          <SelectTrigger className={`w-full ${error ? "border-red-500" : ""}`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </LabelWrapper>
      <FieldErrorMessage error={error} />
    </div>
  );
};

export default LabeledSelectField;
