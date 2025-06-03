import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import FieldErrorMessage from "../error/FieldErrorMessage";
import LabelWrapper from "./LabelWrapper";

interface LabeledInputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  className?: string;
  name: string;
  type?: string;
}

const LabeledInputField: React.FC<LabeledInputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  className = "",
  name,
  ...rest
}) => {
  return (
    <LabelWrapper>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={` ${error ? "border-red-500" : ""} ${className}`}
        {...rest} // Allow additional input props like min, max, step, etc.
      />
      <FieldErrorMessage error={error} />
    </LabelWrapper>
  );
};

export default LabeledInputField;
