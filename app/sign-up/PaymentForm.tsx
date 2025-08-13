"use client";

import React, { useState } from "react";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { pricingOptions } from "../../constants/pricingOptions";
import { isValidEmail } from "../../utils/helpers";
import { PricingOption } from "@/types/types";
import { FrontendErrorMessages } from "@/types/enums";
import { useCreateStripeSubscription } from "./hooks/useCreateStripeSubscription";
import { useValidatePromoCode } from "./hooks/useValidatePromoCode";
import LabeledInputField from "@/components/shared/fields/LabeledInputField";
import PromoCodeInput from "@/components/shared/fields/PromoCodeInput";
import CountdownTimer from "./components/CountdownTimer";
import PlanSelector from "./components/PlanSelector";
import PaymentDetailsSection from "./components/PaymentDetailsSection";
import NProgress from "nprogress";
import { v4 as uuidv4 } from "uuid";

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
  const [selectedPlan, setSelectedPlan] = useState<PricingOption | null>(
    pricingOptions[1]
  );
  const [isCardComplete, setIsCardComplete] = useState<boolean>(false);
  const [promoState, setPromoState] = useState({
    discount: 0,
    promoCode: "",
    promoCodeApplied: false,
    approvedPromoCode: null as string | null,
  });
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

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
        approvedPromoCode: result.approvedPromoCode || null,
      }));
    } else {
      setPromoCodeError("Invalid promo code.");
    }
  };

  const handleElementChange = (event: { complete?: boolean }) => {
    setIsCardComplete(!!event.complete);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPlan) return;

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
      // Trigger client-side validation on the Payment Element
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || FrontendErrorMessages.GENERIC_ERROR);
        setIsLoading(false);
        return;
      }

      // Create a PaymentMethod from the Payment Element
      const { error: pmError, paymentMethod } =
        await stripe.createPaymentMethod({
          elements,
          params: {
            billing_details: { email },
          },
        });

      if (pmError || !paymentMethod) {
        setError(pmError?.message || "Unable to create payment method.");
        setIsLoading(false);
        return;
      }

      const idempotencyKey = uuidv4();

      const success = await createStripeSubscription({
        email,
        paymentMethodId: paymentMethod.id,
        promoCode: promoState.approvedPromoCode,
        subscriptionTier: selectedPlan.tier,
        idempotencyKey,
      });

      if (success) {
        NProgress.start();
        router.push("/confirmation");
      } else {
        setError("Failed to create subscription. Please try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || FrontendErrorMessages.GENERIC_ERROR);
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
            setErrors((prevErrors) => ({ ...prevErrors, email: undefined }));
          }}
          error={errors.email}
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

        {/* Payment Element-driven details */}
        <PaymentDetailsSection
          stripeReady={!!stripe}
          isLoading={isLoading}
          error={error}
          onCardChange={handleElementChange}
          handleSubmit={handleSubmit}
          isCardComplete={isCardComplete}
          email={email}
          termsAccepted={termsAccepted}
          onTermsAccepted={setTermsAccepted}
        />
      </form>
    </main>
  );
};

export default PaymentForm;
