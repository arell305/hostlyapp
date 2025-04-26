import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SingleSubmitButtonProps {
  isLoading: boolean;
  error?: string | null;
  onClick: (() => void) | ((event: React.FormEvent) => void);
  disabled?: boolean;
  label?: string;
}

const SingleSubmitButton: React.FC<SingleSubmitButtonProps> = ({
  isLoading,
  error,
  onClick,
  disabled,
  label = "Submit",
}) => {
  return (
    <div>
      <Button className="mx-auto my-8" onClick={onClick} disabled={disabled}>
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="animate-spin h-4 w-4" aria-hidden="true" />
            <span>{label}...</span>
          </div>
        ) : (
          label
        )}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default SingleSubmitButton;
