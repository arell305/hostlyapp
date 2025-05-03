"use client";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface StaticFieldProps {
  label: string;
  value: string | number | null;
  secondaryValue?: string | null;
  className?: string;
  icon?: ReactNode;
  badge?: string | ReactNode; // Can be string or a custom node
}

const StaticField: React.FC<StaticFieldProps> = ({
  label,
  value,
  secondaryValue,
  className,
  icon,
  badge,
}) => {
  return (
    <div className={"relative w-full border-b px-4 py-3 " + (className || "")}>
      {badge && (
        <div className="absolute top-2 right-3">
          {typeof badge === "string" ? (
            <Badge variant="default">{badge}</Badge>
          ) : (
            badge
          )}
        </div>
      )}
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
