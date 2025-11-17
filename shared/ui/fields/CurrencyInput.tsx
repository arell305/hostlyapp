"use client";

import { NumericFormat } from "react-number-format";
import { Label } from "@shared/ui/primitive/label";
import LabelWrapper from "./LabelWrapper";
import FieldErrorMessage from "../error/FieldErrorMessage";
import { Input } from "@shared/ui/primitive/input";

interface CurrencyInputProps {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  isEditing?: boolean;
  error?: string | null;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  showImmutableMessage?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  disabled = false,
  label,
  value,
  onChange,
  isEditing = true,
  error,
  name,
  placeholder = "$0.00",
  showImmutableMessage = false,
}) => {
  return (
    <div>
      <LabelWrapper>
        {label && <Label htmlFor={name}>{label}</Label>}

        <NumericFormat
          /** render our styled input so it matches all other fields */
          customInput={Input}
          /** forward validation state to Input (so it turns red) */
          error={error}
          id={name}
          name={name}
          inputMode="decimal"
          value={value ?? ""} // keep controlled
          onValueChange={({ value: raw, floatValue }) => {
            if (raw === "") onChange(null);
            else onChange(floatValue ?? 0);
          }}
          thousandSeparator
          decimalScale={2}
          fixedDecimalScale
          prefix="$"
          allowNegative={false}
          placeholder={placeholder}
          disabled={!isEditing || disabled}
        />
      </LabelWrapper>
      {showImmutableMessage && (
        <p className="text-sm text-gray-500">
          To edit price, you must remove and add the ticket again.
        </p>
      )}
      <FieldErrorMessage error={error} />
    </div>
  );
};

export default CurrencyInput;
