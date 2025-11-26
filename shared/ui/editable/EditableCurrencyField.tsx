"use client";

import { Label } from "@shared/ui/primitive/label";
import IconButton from "@shared/ui/buttonContainers/IconButton";
import { NumericFormat } from "react-number-format";
import FieldErrorMessage from "../error/FieldErrorMessage";
import SavingIcon from "../icons/SavingIcon";
import FormattedValueDisplay from "../display/FormattedValueDisplay";
import EditableFieldWrapper from "../containers/EditableFieldWapper";

interface EditableCurrencyFieldProps {
  label: string;
  name: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onSave: () => void;
  isEditing: boolean;
  isSaving: boolean;
  error?: string | null;
  className?: string;
  hasChanges: boolean;
}

const EditableCurrencyField: React.FC<EditableCurrencyFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onSave,
  isEditing,
  isSaving,
  error,
  className,
  hasChanges,
}) => {
  return (
    <EditableFieldWrapper className={className}>
      <Label htmlFor={name} className="font-normal text-grayText">
        {label}
      </Label>

      {isEditing ? (
        <div className="flex items-start gap-2 mt-1">
          <div className="flex flex-col w-full">
            <NumericFormat
              id={name}
              value={value === null ? "" : value}
              onValueChange={(vals) =>
                vals.value === ""
                  ? onChange(null)
                  : onChange(vals.floatValue ?? 0)
              }
              thousandSeparator
              decimalScale={2}
              fixedDecimalScale
              type="tel"
              inputMode="decimal"
              prefix="$"
              allowNegative={false}
              placeholder="$0.00"
              className={`focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full rounded-md border px-2 py-1 text-base bg-transparent text-white ${
                error
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-grayCustom"
              }`}
            />
            <FieldErrorMessage error={error} />
          </div>

          <IconButton
            icon={<SavingIcon isSaving={isSaving} />}
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            title={!hasChanges ? "No changes" : "Save"}
            className={!hasChanges ? "opacity-50 cursor-not-allowed" : ""}
          />
        </div>
      ) : (
        <FormattedValueDisplay
          value={value}
          isCurrency
          fallbackText="Not Set"
        />
      )}
    </EditableFieldWrapper>
  );
};

export default EditableCurrencyField;
