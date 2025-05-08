import { CheckSquare, Square } from "lucide-react";

interface CheckboxIconProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  checkedLabel?: string;
  uncheckedLabel?: string;
  className?: string;
}

const CheckboxIcon: React.FC<CheckboxIconProps> = ({
  checked,
  onToggle,
  label,
  checkedLabel,
  uncheckedLabel,
  className = "",
}) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 text-sm text-grayText hover:opacity-80 hover:underline transition ${className}`}
    >
      {checked ? (
        <CheckSquare className="w-5 h-5 text-grayText" />
      ) : (
        <Square className="w-5 h-5 text-grayText" />
      )}
      <span>
        {label ??
          (checked ? checkedLabel ?? "Checked" : uncheckedLabel ?? "Unchecked")}
      </span>
    </button>
  );
};

export default CheckboxIcon;
