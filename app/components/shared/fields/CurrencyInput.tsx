import { NumericFormat } from "react-number-format";
import { Label } from "@/components/ui/label";
import LabelWrapper from "./LabelWrapper";
import FieldErrorMessage from "../error/FieldErrorMessage";

interface CurrencyInputProps {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  isEditing?: boolean;
  error?: string | null;
  name: string;
  placeholder?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  isEditing = true,
  error,
  name,
  placeholder = "$0.00",
}) => {
  return (
    <div>
      <LabelWrapper>
        <Label htmlFor={name}>{label}</Label>
        <NumericFormat
          value={value === null ? "" : value}
          onValueChange={(values) => {
            if (values.value === "") {
              onChange(null); // handle empty input
            } else {
              const numericValue = values.floatValue ?? 0;
              onChange(numericValue);
            }
          }}
          thousandSeparator
          decimalScale={2}
          fixedDecimalScale
          prefix="$"
          allowNegative={false}
          placeholder={placeholder}
          disabled={!isEditing}
          className={`focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full rounded-md border px-2 py-1 text-base bg-transparent text-white ${
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-grayCustom"
          }`}
        />
      </LabelWrapper>
      <FieldErrorMessage error={error} />{" "}
    </div>
  );
};

export default CurrencyInput;
