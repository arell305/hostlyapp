import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import LabelWrapper from "./LabelWrapper";
import FieldErrorMessage from "../error/FieldErrorMessage";

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
    <div>
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
      </LabelWrapper>
      <FieldErrorMessage error={error} />
    </div>
  );
};

export default LabeledTextAreaField;
