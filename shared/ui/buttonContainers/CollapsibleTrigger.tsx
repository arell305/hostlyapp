"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@shared/ui/primitive/label";
import { cn } from "@/shared/lib/utils";

interface CollapsibleTriggerProps {
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({
  label,
  isExpanded,
  onToggle,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-1 text-left focus:outline-none mb-2",
        className
      )}
    >
      <Label className="font-medium">{label}</Label>
      {isExpanded ? (
        <ChevronUp className="h-4 w-4 " />
      ) : (
        <ChevronDown className="h-4 w-4 " />
      )}
    </button>
  );
};

export default CollapsibleTrigger;
