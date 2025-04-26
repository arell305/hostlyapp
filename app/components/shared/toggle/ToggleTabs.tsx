// components/ui/ToggleTabs.tsx

import React from "react";
import { Label } from "@/components/ui/label";

interface ToggleTabsProps<T> {
  label?: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const ToggleTabs = <T extends string>({
  label,
  options,
  value,
  onChange,
  className = "",
}: ToggleTabsProps<T>) => {
  return (
    <div className="space-y-2">
      {label && <Label className="block text-sm font-medium">{label}</Label>}
      <div
        className={`inline-flex gap-2 rounded-lg border border-borderGray p-1 ${className}`}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-md px-4 py-1 text-sm font-medium transition ${
              value === option.value
                ? "bg-cardBackgroundHover text-whiteText"
                : "text-grayText hover:bg-cardBackgroundHover/70 hover:text-whiteText "
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToggleTabs;
