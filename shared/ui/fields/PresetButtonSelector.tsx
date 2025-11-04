"use client";

import { Button } from "@shared/ui/primitive/button";
import { Label } from "@shared/ui/primitive/label";
import FieldErrorMessage from "../error/FieldErrorMessage";
import LabelWrapper from "./LabelWrapper";

interface PresetOption<T = string> {
  value: T;
  label: string;
}

interface PresetButtonSelectorProps<T = string> {
  label: string;
  name: string;
  options: T[] | PresetOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  error?: string | null;
  className?: string;
  disabledValues?: T[];
  required?: boolean;
}

function PresetButtonSelector<T extends string = string>({
  label,
  name,
  options,
  value,
  onChange,
  error,
  className = "",
  disabledValues = [],
  required = false,
}: PresetButtonSelectorProps<T>) {
  const normalizedOptions: PresetOption<T>[] = options.map((opt) =>
    typeof opt === "string" || typeof opt === "number"
      ? { value: opt as T, label: String(opt) }
      : opt
  );

  return (
    <div className={className}>
      <LabelWrapper className="space-y-2">
        <Label htmlFor={name}>
          {label}
          {required && "*"}
        </Label>
        <div
          className="flex flex-wrap gap-2 mt-2"
          role="group"
          aria-labelledby={name}
        >
          {normalizedOptions.map((option) => {
            const isSelected = value === option.value;
            const isDisabled = disabledValues.includes(option.value);

            return (
              <Button
                key={String(option.value)}
                type="button"
                variant={"selection"}
                className={isSelected ? "border-primaryBlue" : ""}
                size="xs"
                disabled={isDisabled}
                onClick={() => onChange(option.value)}
                aria-pressed={isSelected}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </LabelWrapper>
      <FieldErrorMessage error={error} />
    </div>
  );
}

export default PresetButtonSelector;
