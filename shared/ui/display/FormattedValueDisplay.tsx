import { formatCurrency } from "@/shared/utils/helpers";
import { cn } from "@shared/lib/utils";

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
