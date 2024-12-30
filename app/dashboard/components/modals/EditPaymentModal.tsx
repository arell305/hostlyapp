import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardElement } from "@stripe/react-stripe-js";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface EditPaymentModaltModalProps {
  onClose: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onEditPayment: () => void;
  onChange: (event: any) => void;
}

const EditPaymentModal: React.FC<EditPaymentModaltModalProps> = ({
  onClose,
  isOpen,
  onOpenChange,
  onEditPayment,
  error,
  isLoading,
  onChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex">Update Payment</DialogTitle>
        </DialogHeader>
        <div
          className={cn(
            "rounded-none w-full border-b-2 bg-transparent py-1 focus-within:outline-none",
            error ? "border-red-500" : "border-gray-300",
            "focus-within:border-customDarkBlue"
          )}
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#2d3748", // Equivalent to `text-gray-800`
                  backgroundColor: "transparent",
                  "::placeholder": { color: "#a0aec0" }, // Placeholder color equivalent to `text-gray-400`
                },
                invalid: {
                  color: "#e53e3e", // Red color for invalid state
                },
              },
            }}
            onChange={onChange}
          />
        </div>
        <p
          className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
        >
          {error || "Placeholder to maintain height"}
        </p>{" "}
        <div className="flex justify-center space-x-10">
          <Button
            disabled={isLoading}
            variant="ghost"
            onClick={onClose}
            className="font-semibold  w-[140px]"
          >
            Cancel
          </Button>
          <Button
            className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
            onClick={onEditPayment}
            disabled={isLoading}
          >
            {" "}
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPaymentModal;
