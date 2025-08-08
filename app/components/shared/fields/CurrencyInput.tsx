import { NumericFormat } from "react-number-format";
import { Label } from "@/components/ui/label";
import LabelWrapper from "./LabelWrapper";
import FieldErrorMessage from "../error/FieldErrorMessage";
import { Input } from "@/components/ui/input";

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
          disabled={!isEditing}
        />
      </LabelWrapper>

      <FieldErrorMessage error={error} />
    </div>
  );
};

export default CurrencyInput;
