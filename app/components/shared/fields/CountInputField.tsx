import { Input } from "@/components/ui/input";
import IconButton from "../buttonContainers/IconButton";
import { Minus, Plus } from "lucide-react";

interface CountInputFieldProps {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
}

const CountInputField: React.FC<CountInputFieldProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col items-center">
      <label className="text-xl md:text-base mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <IconButton
          icon={<Minus />}
          onClick={() => onChange(Math.max(0, value - 1))}
        />

        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="w-10 text-center text-xl"
          onFocus={(e) => e.target.select()}
        />

        <IconButton icon={<Plus />} onClick={() => onChange(value + 1)} />
      </div>
    </div>
  );
};

export default CountInputField;
