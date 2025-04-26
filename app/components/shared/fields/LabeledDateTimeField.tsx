import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import LabelWrapper from "./LabelWrapper";

interface LabeledDateTimeFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  name: string;
  placeholder?: string;
  className?: string;
  isIOS?: boolean;
}

const LabeledDateTimeField: React.FC<LabeledDateTimeFieldProps> = ({
  label,
  value,
  onChange,
  error,
  name,
  placeholder = "Select date and time",
  className = "",
  isIOS = false,
}) => {
  const isEmpty = !value;

  return (
    <LabelWrapper>
      <Label htmlFor={name}>{label}</Label>
      <div className="relative w-full max-w-[500px]">
        <Input
          id={name}
          name={name}
          type="datetime-local"
          value={value}
          onChange={onChange}
          className={`h-10 ${isEmpty && isIOS ? "text-transparent" : ""} ${
            error ? "border-red-500" : ""
          } ${className}`}
        />
        {isEmpty && isIOS && (
          <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            {placeholder}
          </span>
        )}
      </div>
      <p className={`text-sm ${error ? "text-red-500" : "text-transparent"}`}>
        {error || "Placeholder to maintain height"}
      </p>
    </LabelWrapper>
  );
};

export default LabeledDateTimeField;
