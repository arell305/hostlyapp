import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import LabelWrapper from "./LabelWrapper";

interface LabeledTextAreaFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  error?: string | null;
  name?: string;
  className?: string;
}

const LabeledTextAreaField: React.FC<LabeledTextAreaFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  error,
  name,
  className = "",
}) => {
  return (
    <LabelWrapper>
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`${error ? "border-red-500" : ""} ${className}`}
      />
      <p className={`text-sm ${error ? "text-red-500" : "text-transparent"}`}>
        {error || "Placeholder to maintain height"}
      </p>
    </LabelWrapper>
  );
};

export default LabeledTextAreaField;
