"use client";

import { Label } from "@/components/ui/label";

interface StaticFieldProps {
  label: string;
  value: string | number | null;
  secondaryValue?: string | null;
  className?: string;
}

const StaticField: React.FC<StaticFieldProps> = ({
  label,
  value,
  secondaryValue,
  className,
}) => {
  return (
    <div className={"w-full border-b px-4 py-3 " + (className || "")}>
      <Label className="font-normal text-grayText">{label}</Label>
      <div className="mt-0.5">
        <p className="text-xl font-semibold">
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
