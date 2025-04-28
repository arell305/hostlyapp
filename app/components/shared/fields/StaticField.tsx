"use client";

import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface StaticFieldProps {
  label: string;
  value: string | number | null;
  secondaryValue?: string | null;
  className?: string;
  icon?: ReactNode; // <-- NEW
}

const StaticField: React.FC<StaticFieldProps> = ({
  label,
  value,
  secondaryValue,
  className,
  icon,
}) => {
  return (
    <div className={"w-full border-b px-4 py-3 " + (className || "")}>
      <div className="flex items-center gap-2">
        {icon && <div className="text-grayText">{icon}</div>}
        <Label className="font-normal text-grayText">{label}</Label>
      </div>
      <div className="mt-0.5">
        <p className="text-lg font-medium">
          {value !== null && value !== undefined && value !== ""
            ? value
            : "Not Set"}
        </p>
        {secondaryValue && (
          <p className="text-sm text-green-600">{secondaryValue}</p>
        )}
      </div>
    </div>
  );
};

export default StaticField;
