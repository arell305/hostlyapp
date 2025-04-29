"use client";

import React, { useState, useEffect } from "react";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { pricingOptions } from "../../constants/pricingOptions";
import { calculateDiscountedAmount, isValidEmail } from "../../utils/helpers";
import { PricingOption } from "@/types/types";
import { FrontendErrorMessages } from "@/types/enums";
import { useCreateStripeSubscription } from "./hooks/useCreateStripeSubscription";
import { useValidatePromoCode } from "./hooks/useValidatePromoCode";
import LabeledInputField from "@/components/shared/fields/LabeledInputField";
import PromoCodeInput from "@/components/shared/fields/PromoCodeInput";
import CountdownTimer from "./components/CountdownTimer";
import PlanSelector from "./components/PlanSelector";
import PaymentMethodSelector from "./components/PaymentMethodSelector";
import PaymentDetailsSection from "./components/PaymentDetailsSection";
import {
  createApplePaymentRequest,
  getCardPaymentMethod,
} from "../../utils/frontend-stripe/stripeHelpers";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const { createStripeSubscription, isLoading, error, setIsLoading, setError } =
    useCreateStripeSubscription();

  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string; promoCode?: string }>(
    {}
  );
  const [focused, setFocused] = useState<boolean>(false);
  const [cardError, setCardError] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingOption | null>(
    pricingOptions[1]
  );
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null
  );
  const [canMakePayment, setCanMakePayment] = useState<boolean>(false);
  const [promoState, setPromoState] = useState({
    discount: 0,
    promoCode: "",
    promoCodeApplied: false,
    promoCodeId: null as string | null,
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "apple" | "card"
  >("card");

  const {
    validatePromoCode,
    isLoading: isPromoLoading,
    error: promoCodeError,
    setError: setPromoCodeError,
  } = useValidatePromoCode();

  const handleApplyPromoCode = async () => {
    const result = await validatePromoCode(promoState.promoCode);

    if (result.isValid) {
      setPromoState((prevState) => ({
        ...prevState,
        discount: result.discount ?? 0,
        promoCodeApplied: true,
        promoCodeId: result.promoCodeId || null,
      }));
    } else {
      setPromoCodeError("Invalid promo code.");
    }
  };

  useEffect(() => {
    if (!stripe || !selectedPlan) return;

    const amount = calculateDiscountedAmount(
      selectedPlan.price,
      promoState.discount
    );
    if (isNaN(amount)) return;

    createApplePaymentRequest(stripe, amount, async (ev) => {
      setIsLoading(true);
      const finalEmail = email || ev.payerEmail;
      if (!finalEmail) {
        setError("Invalid email");
        setIsLoading(false);
        return;
      }

      const success = await createStripeSubscription({
        email: finalEmail,
        paymentMethodId: ev.paymentMethod.id,
        priceId: selectedPlan.priceId,
        promoCodeId: promoState.promoCodeId,
        subscriptionTier: selectedPlan.tier,
      });

      ev.complete(success ? "success" : "fail");

      if (success) router.push("/confirmation");
      else setError("Failed to create subscription. Please try again.");
    }).then((pr) => {
      if (pr) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });
  }, [stripe, selectedPlan, promoState, email, router, setError, setIsLoading]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setErrors((prev) => ({
        ...prev,
        email: FrontendErrorMessages.EMAIL_REQUIRED,
      }));
      return;
    }

    if (!stripe || !elements) {
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return;
    }

    setIsLoading(true);

    try {
      const paymentMethod = await getCardPaymentMethod(stripe, elements, email);

      const success = await createStripeSubscription({
        email,
        paymentMethodId: paymentMethod.id,
        priceId: selectedPlan!.priceId,
        promoCodeId: promoState.promoCodeId,
        subscriptionTier: selectedPlan!.tier,
      });

      if (success) {
        router.push("/confirmation");
      } else {
        setError("Failed to create subscription. Please try again.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 600);

  return (
    <main className="justify-center max-w-2xl mx-auto mt-4 mb-10">
      <form onSubmit={handleSubmit} className="px-4">
        {/* Countdown */}
        <CountdownTimer expiryTimestamp={expiryTimestamp} className="mb-6" />

        {/* Plan Selection */}
        <PlanSelector
          options={pricingOptions}
          selectedPlan={selectedPlan}
          onSelect={setSelectedPlan}
          discount={promoState.discount}
        />

        <LabeledInputField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prevErrors) => ({ ...prevErrors, email: undefined })); // Reset the email error
          }}
          error={errors.email} // Pass the error state here
        />

        {/* Promo Code */}
        <PromoCodeInput
          promoCode={promoState.promoCode}
          onChange={(value) =>
            setPromoState((prev) => ({ ...prev, promoCode: value }))
          }
          onApply={handleApplyPromoCode}
          isLoading={isPromoLoading}
          error={promoCodeError}
          success={promoState.promoCodeApplied}
        />

        <PaymentMethodSelector
          selected={selectedPaymentMethod}
          onSelect={setSelectedPaymentMethod}
        />

        <PaymentDetailsSection
          method={selectedPaymentMethod}
          stripeReady={!!stripe}
          isLoading={isLoading}
          error={error}
          cardError={cardError}
          focused={focused}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onCardChange={(e) => setCardError(!!e.error)}
          onApplePayClick={() => paymentRequest?.show()}
          paymentRequest={paymentRequest}
          handleSubmit={handleSubmit}
        />
      </form>
    </main>
  );
};

export default PaymentForm;
