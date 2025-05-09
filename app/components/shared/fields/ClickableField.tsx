"use client";

import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface ClickableFieldProps {
  label: string;
  value: string | number | null;
  onClick: () => void;
  className?: string;
  icon?: ReactNode; // leading icon
  actionIcon?: ReactNode; // right-side icon (e.g. pencil)
}

const ClickableField: React.FC<ClickableFieldProps> = ({
  label,
  value,
  onClick,
  className,
  icon,
  actionIcon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative w-full text-left border-b px-4 py-3 hover:bg-cardBackgroundHover transition " +
        (className || "")
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {icon && <div className="text-grayText">{icon}</div>}
            <Label className="font-normal text-grayText">{label}</Label>
          </div>
          <p className="mt-0.5 text-lg font-medium">
            {value !== null && value !== undefined && value !== ""
              ? value
              : "Not Set"}
          </p>
        </div>
        {actionIcon && <div className="text-whiteText">{actionIcon}</div>}
      </div>
    </button>
  );
};

export default ClickableField;
