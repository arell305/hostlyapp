import BaseDrawer from "./BaseDrawer";
import { cn } from "@/shared/lib/utils";
import { CardElement, Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/shared/utils/stripe";

interface EditPaymentDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onEditPayment: () => void;
  onChange: (event: any) => void;
}

const EditPaymentDrawer: React.FC<EditPaymentDrawerProps> = ({
  isOpen,
  onOpenChange,
  onEditPayment,
  error,
  isLoading,
  onChange,
}) => {
  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Update Payment"
      description={`Enter in a new method`}
      confirmText={isLoading ? "Saving..." : "Save"}
      cancelText="Cancel"
      onSubmit={onEditPayment}
      error={error}
      isLoading={isLoading}
    >
      <Elements stripe={stripePromise}>
        <div
          className={cn(
            "rounded-none  border-b-2 bg-transparent py-1 mx-2 focus-within:outline-none", // Changed mx-4 to px-4
            error ? "border-red-500" : "border-gray-300",
            "focus-within:border-customDarkBlue",
            "box-border mx-2" // Ensure padding is included in width calculation
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
      </Elements>
    </BaseDrawer>
  );
};

export default EditPaymentDrawer;
