import { CardElement } from "@stripe/react-stripe-js";
import { FaApple } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import SingleSubmitButton from "@/components/shared/buttonContainers/SingleSubmitButton";
import { Label } from "@/components/ui/label";

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
  isCardComplete: boolean;
  email: string;
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
  isCardComplete,
  email,
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
      <Label>Card Details</Label>
      <div
        className={`p-2 border mb-6 mt-1 text-white rounded-md ${
          cardError ? "border-red-500" : focused ? "border-primaryBlue" : ""
        }`}
      >
        <CardElement
          options={{
            style: {
              base: {
                color: "#F9FAFA",
                fontSize: "16px",
                "::placeholder": {
                  color: "#A2A5AD",
                },
              },
            },
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onCardChange}
        />
      </div>
      <SingleSubmitButton
        isLoading={isLoading}
        error={error}
        onClick={handleSubmit}
        disabled={
          !stripeReady || isLoading || !isCardComplete || email.trim() === ""
        }
        label="Subscribe"
      />
    </>
  );
};

export default PaymentDetailsSection;
