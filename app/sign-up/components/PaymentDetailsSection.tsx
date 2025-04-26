import { CardElement } from "@stripe/react-stripe-js";
import { FaApple } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import SingleSubmitButton from "@/components/shared/buttonContainers/SingleSubmitButton";

interface PaymentDetailsSectionProps {
  method: "card" | "apple";
  stripeReady: boolean;
  isLoading: boolean;
  error: string | null;
  cardError: boolean;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onCardChange: (e: any) => void;
  onApplePayClick: () => void;
  paymentRequest: PaymentRequest | null;
  handleSubmit: (e: React.FormEvent) => void;
}

const PaymentDetailsSection: React.FC<PaymentDetailsSectionProps> = ({
  method,
  stripeReady,
  isLoading,
  error,
  cardError,
  focused,
  onFocus,
  onBlur,
  onCardChange,
  onApplePayClick,
  paymentRequest,
  handleSubmit,
}) => {
  if (method === "apple") {
    return (
      <div className="mb-8">
        {paymentRequest ? (
          <Button
            type="button"
            onClick={onApplePayClick}
            className="w-full bg-black text-white"
          >
            <FaApple className="mr-2" />
            Subscribe with Apple Pay
          </Button>
        ) : (
          <p className="text-red-600">Apple Pay is not available.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <label className="block text-sm font-medium mb-2">Card Details</label>
      <div
        className={`p-2 border-b-2 mb-6 ${
          cardError
            ? "border-red-500"
            : focused
              ? "border-blue-500"
              : "border-gray-300"
        }`}
      >
        <CardElement
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onCardChange}
        />
      </div>
      <SingleSubmitButton
        isLoading={isLoading}
        error={error}
        onClick={handleSubmit}
        disabled={!stripeReady || isLoading}
        label="Subscribe"
      />
    </>
  );
};

export default PaymentDetailsSection;
