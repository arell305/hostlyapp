"use client";

import { Input } from "@shared/ui/primitive/input";
import { Label } from "@shared/ui/primitive/label";
import FieldErrorMessage from "../error/FieldErrorMessage";
import LabelWrapper from "./LabelWrapper";
import {
  formatToDateTimeLocalPST,
  parseDateTimeLocalToTimestampPST,
} from "@/shared/utils/luxon";

interface LabeledDateTimeFieldProps {
  label: string;
  value: number | null;
  onChange: (val: number | null) => void;
  error?: string;
  name: string;
  placeholder?: string;
  className?: string;
  isIOS?: boolean;
  min?: string;
}

const LabeledDateTimeField: React.FC<LabeledDateTimeFieldProps> = ({
  label,
  value,
  onChange,
  error,
  name,
  placeholder = "Select date and time",
  className = "",
  isIOS = false,
  min,
}) => {
  const formattedValue = formatToDateTimeLocalPST(value);
  const isEmpty = !formattedValue;

  return (
    <div>
      <LabelWrapper>
        <Label htmlFor={name}>{label}</Label>
        <div className="relative w-full">
          <Input
            id={name}
            name={name}
            type="datetime-local"
            value={formattedValue}
            onChange={(e) =>
              onChange(parseDateTimeLocalToTimestampPST(e.target.value))
            }
            className={`h-10 ${isEmpty && isIOS ? "text-transparent" : ""} ${
              error ? "border-red-500" : ""
            } ${className}`}
            min={min}
          />
          {isEmpty && isIOS && (
            <span className="pl-2 absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {placeholder}
            </span>
          )}
        </div>
      </LabelWrapper>
      <FieldErrorMessage error={error} />
    </div>
  );
};

export default LabeledDateTimeField;
