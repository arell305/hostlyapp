import { cn } from "@/shared/lib/utils";
import { Button } from "../primitive/button";
import { Label } from "../primitive/label";

type PresetButton<T extends string> = {
  value: T;
  label: string;
};

interface PresetButtonsProps<T extends string> {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  presets: readonly PresetButton<T>[];
  className?: string;
  stacked?: boolean;
  stackedWidth?: string;
}

export function PresetButtons<T extends string>({
  label,
  value,
  onValueChange,
  presets,
  className,
  stacked = false,
  stackedWidth = "md:w-[300px]",
}: PresetButtonsProps<T>) {
  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-base font-medium">{label}</Label>

      <div
        className={cn(
          "flex gap-2",
          stacked ? "flex-col" : "flex-wrap",
          stacked && stackedWidth
        )}
      >
        {presets.map(({ value: presetValue, label: presetLabel }) => (
          <Button
            key={presetValue}
            type="button"
            variant={value === presetValue ? "selectedOutline" : "outline"}
            size="sm"
            onClick={() => onValueChange(presetValue)}
            className={cn(
              "justify-start",
              stacked ? "w-full" : "flex-1 min-w-fit"
            )}
          >
            <span className="truncate">{presetLabel}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
