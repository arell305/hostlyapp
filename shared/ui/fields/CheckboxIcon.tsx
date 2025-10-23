"use client";

import { CheckSquare, Square } from "lucide-react";

interface CheckboxIconProps {
  checked: boolean;
  onToggle: () => void;
  label?: React.ReactNode;
  checkedLabel?: string;
  uncheckedLabel?: string;
  className?: string;
}

const CheckboxIcon: React.FC<CheckboxIconProps> = ({
  checked,
  onToggle,
  label,
  checkedLabel,
  uncheckedLabel,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-2 text-sm text-grayText ${className}`}
    >
      <button
        onClick={onToggle}
        className="hover:opacity-80 transition"
        aria-label="Toggle checkbox"
        type="button"
      >
        {checked ? (
          <CheckSquare className="w-5 h-5 text-grayText" />
        ) : (
          <Square className="w-5 h-5 text-grayText" />
        )}
      </button>
      <span className="select-none">
        {label ??
          (checked ? checkedLabel ?? "Checked" : uncheckedLabel ?? "Unchecked")}
      </span>
    </div>
  );
};

export default CheckboxIcon;
