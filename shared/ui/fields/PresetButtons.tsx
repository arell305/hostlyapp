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
}

export function PresetButtons<T extends string>({
  label,
  value,
  onValueChange,
  presets,
  className,
}: PresetButtonsProps<T>) {
  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-base font-medium">{label}</Label>

      <div className="flex flex-wrap gap-2">
        {presets.map(({ value: presetValue, label: presetLabel }) => (
          <Button
            key={presetValue}
            type="button"
            variant={value === presetValue ? "selectedOutline" : "outline"}
            size="sm"
            onClick={() => onValueChange(presetValue)}
          >
            {presetLabel}
          </Button>
        ))}
      </div>
    </div>
  );
}
