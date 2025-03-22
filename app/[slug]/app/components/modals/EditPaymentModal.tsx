import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { CardElement, Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../../../../../utils/stripe";

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
          <DialogDescription>
            Update the payment information for your subscription.
          </DialogDescription>
        </DialogHeader>
        <Elements stripe={stripePromise}>
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
                    color: "#2d3748",
                    backgroundColor: "transparent",
                    "::placeholder": { color: "#a0aec0" },
                  },
                  invalid: {
                    color: "#e53e3e",
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
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default EditPaymentModal;
