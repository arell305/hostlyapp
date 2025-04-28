"use client";

import { cn } from "@/lib/utils";

interface SectionTitleWithStatusProps {
  title: string;
  statusText?: string;
  statusColor?: string; // optional for dynamic color
  className?: string;
}

const SectionTitleWithStatus: React.FC<SectionTitleWithStatusProps> = ({
  title,
  statusText,
  statusColor = "text-red-700", // default red
  className,
}) => {
  return (
    <div
      className={cn("flex items-center justify-between px-4 pt-3", className)}
    >
      <h2 className="text-xl font-bold pb-3">{title}</h2>
      {statusText && (
        <p className={cn("font-semibold", statusColor)}>{statusText}</p>
      )}
    </div>
  );
};

export default SectionTitleWithStatus;
