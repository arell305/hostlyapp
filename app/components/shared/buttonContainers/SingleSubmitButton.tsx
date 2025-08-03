import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // assuming you're using a `cn` utility like clsx
import FieldErrorMessage from "../error/FieldErrorMessage";

interface SingleSubmitButtonProps {
  isLoading: boolean;
  error?: string | null;
  onClick: (() => void) | ((event: React.FormEvent) => void);
  disabled?: boolean;
  label?: string;
  className?: string;
}

const SingleSubmitButton: React.FC<SingleSubmitButtonProps> = ({
  isLoading,
  error,
  onClick,
  disabled,
  label = "Submit",
  className,
}) => {
  return (
    <div className={cn("pt-4 my-8", className)}>
      <Button onClick={onClick} disabled={disabled} type="button">
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="animate-spin h-4 w-4" />
            <span>{label}...</span>
          </div>
        ) : (
          label
        )}
      </Button>
      <FieldErrorMessage error={error} />
    </div>
  );
};

export default SingleSubmitButton;
