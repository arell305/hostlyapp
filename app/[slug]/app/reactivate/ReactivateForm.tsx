import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PricingOption } from "@/types/types";
import { useRouter } from "next/router";
import { useReactivateSubscription } from "../hooks/useReactivateSubscription";
import { useValidatePromoCode } from "../hooks/useValidatePromoCode";
import { UserResource } from "@clerk/types";
import { pricingOptions } from "../../../../constants/pricingOptions";

export interface ReactivateFormProps {
  user: UserResource;
}

const ReactivateForm: React.FC<ReactivateFormProps> = ({ user }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const { handleReactivate, loading, error, slug } =
    useReactivateSubscription();
  const { handleValidatePromoCode, loading: isPromoLoading } =
    useValidatePromoCode();

  const [selectedPlan, setSelectedPlan] = useState<PricingOption | null>(
    pricingOptions[1]
  );
  const [promoState, setPromoState] = useState({
    discount: 0,
    promoCode: "",
    promoCodeApplied: false,
    promoCodeId: null as string | null,
  });
  const [cardError, setCardError] = useState<string | null>(null);

  const handleApplyPromoCode = async () => {
    if (!promoState.promoCode) return;
    const result = await handleValidatePromoCode(promoState.promoCode);
    if (result.isValid) {
      setPromoState({
        ...promoState,
        discount: result.discount ?? 0,
        promoCodeApplied: true,
        promoCodeId: result.promoCodeId || null,
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !selectedPlan) {
      setCardError("Stripe is not properly initialized.");
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError("Card details are required.");
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: { email: user.emailAddresses[0].emailAddress },
    });

    if (error) {
      setCardError(
        error.message || "An error occurred while processing payment."
      );
      return;
    }

    const result = await handleReactivate({
      paymentMethodId: paymentMethod.id,
      priceId: selectedPlan.priceId,
      promoCodeId: promoState.promoCodeId,
      subscriptionTier: selectedPlan.tier,
    });

    if (result) {
      router.push(`/${slug}/admin`);
    }
  };

  return (
    <main className="justify-center max-w-2xl mx-auto mt-4 mb-10">
      <form onSubmit={handleSubmit} className="px-4">
        <Label>Select Your Plan</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-2 mt-2">
          {pricingOptions.map((option) => (
            <div key={option.id} onClick={() => setSelectedPlan(option)}>
              <h3>{option.tier}</h3>
              <p>{option.price}/month</p>
            </div>
          ))}
        </div>

        <Label htmlFor="promoCode">Promo Code</Label>
        <div className="flex items-center">
          <Input
            id="promoCode"
            value={promoState.promoCode}
            onChange={(e) =>
              setPromoState({ ...promoState, promoCode: e.target.value })
            }
          />
          <Button onClick={handleApplyPromoCode} disabled={isPromoLoading}>
            Apply
          </Button>
        </div>
        {promoState.promoCodeApplied && <p>Promo code applied!</p>}

        <Label>Card Details</Label>
        <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
        {cardError && <p className="text-red-500">{cardError}</p>}
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Subscribe"}
        </Button>
      </form>
    </main>
  );
};

export default ReactivateForm;
