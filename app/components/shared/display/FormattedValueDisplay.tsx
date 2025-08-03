import { formatCurrency } from "@/utils/helpers";
import { cn } from "@/lib/utils"; // optional, if you're using class merging utility

interface FormattedValueDisplayProps {
  value: string | number | null;
  isCurrency?: boolean;
  fallbackText?: string;
  className?: string;
}

const FormattedValueDisplay: React.FC<FormattedValueDisplayProps> = ({
  value,
  isCurrency = false,
  fallbackText = "Not Set",
  className = "",
}) => {
  const displayValue =
    value !== null && value !== ""
      ? isCurrency
        ? formatCurrency(Number(value))
        : value
      : fallbackText;

  return (
    <p className={cn("text-xl font-semibold mt-0.5", className)}>
      {displayValue}
    </p>
  );
};

export default FormattedValueDisplay;
