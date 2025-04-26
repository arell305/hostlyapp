import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import LabelWrapper from "./LabelWrapper";

interface LabeledSelectFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  className?: string;
}

const LabeledSelectField: React.FC<LabeledSelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  className = "",
}) => {
  return (
    <LabelWrapper>
      <Label>{label}</Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger className={`w-full ${error ? "border-red-500" : ""}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className={`text-sm ${error ? "text-red-500" : "text-transparent"}`}>
        {error || "Placeholder to maintain height"}
      </p>
    </LabelWrapper>
  );
};

export default LabeledSelectField;
