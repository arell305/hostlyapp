"use client";

import React, { useState, useEffect } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FaApple } from "react-icons/fa";
import { pricingOptions } from "../../constants/pricingOptions";
import { useTimer } from "react-timer-hook";
import {
  calculateDiscountedAmount,
  truncatedToTwoDecimalPlaces,
} from "../../utils/helpers";
import { api } from "../../convex/_generated/api";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { PricingOption } from "@/types/types";
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import { FrontendErrorMessages } from "@/types/enums";
import { FaCreditCard } from "react-icons/fa";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const createStripeSubscription = useAction(
    api.stripe.createStripeSubscription
  );

  const validatePromoCode = useAction(api.stripe.validatePromoCode);
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState<boolean>(false);
  const [cardError, setCardError] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingOption | null>(
    pricingOptions[1]
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null
  );
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState<string>("");
  const [promoState, setPromoState] = useState({
    discount: 0,
    promoCode: "",
    promoCodeApplied: false,
    promoCodeId: null as string | null,
  });
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "apple" | "card"
  >("card");

  const handleApplyPromoCode = async () => {
    setPromoCodeError("");
    setIsPromoLoading(true);
    try {
      const result = await validatePromoCode({
        promoCode: promoState.promoCode,
      });
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
    } catch (error) {
      console.error(error, FrontendErrorMessages.PROMO_CODE_FAILED);
      setPromoCodeError(FrontendErrorMessages.PROMO_CODE_FAILED);
    } finally {
      setIsPromoLoading(false);
    }
  };

  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 600);

  const { seconds, minutes } = useTimer({
    expiryTimestamp,
  });

  useEffect(() => {
    if (!stripe || !selectedPlan) {
      return;
    }

    // Calculate price
    const amount = calculateDiscountedAmount(
      selectedPlan.price,
      promoState.discount
    );

    if (isNaN(amount)) {
      console.error("Invalid price amount.");
      return;
    }

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: {
        label: "Total",
        amount, // Ensure amount is an integer
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr as unknown as PaymentRequest);
        setCanMakePayment(true);
      }
    });

    pr.on("paymentmethod", async (ev) => {
      setLoading(true);
      const finalEmail = email || ev.payerEmail;
      if (!finalEmail) {
        setErrorMessage("invalid email");
        setLoading(false);
        return;
      }
      try {
        const result = await createStripeSubscription({
          email: finalEmail,
          paymentMethodId: ev.paymentMethod.id,
          priceId: selectedPlan.priceId,
          promoCodeId: promoState.promoCodeId,
          subscriptionTier: selectedPlan.tier,
        });

        if (result.customerId && result.subscriptionId) {
          ev.complete("success");
          router.push("/confirmation");
        } else {
          ev.complete("fail");
          setErrorMessage("Failed to create subscription. Please try again.");
        }
      } catch (error) {
        console.error("Subscription error:", error);
        ev.complete("fail");
        setErrorMessage("Subscription failed. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  }, [
    stripe,
    selectedPlan,
    promoState,
    email,
    createStripeSubscription,
    router,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: { email },
    });

    if (error) {
      setErrorMessage(error.message || ERROR_MESSAGES.GENERIC_PAYMENT_ERROR);
      setLoading(false);
      return;
    }
    try {
      if (!selectedPlan) {
        return;
      }
      const result = await createStripeSubscription({
        email,
        paymentMethodId: paymentMethod.id,
        priceId: selectedPlan.priceId,
        promoCodeId: promoState.promoCodeId,
        subscriptionTier: selectedPlan.tier,
      });

      if (result.customerId && result.subscriptionId) {
        router.push("/confirmation");
      } else {
        setErrorMessage(ERROR_MESSAGES.SUBSCRIPTION_CREATION_FAILED);
      }
    } catch (error: any) {
      console.log("error", error.message);
      if (error.message.includes(ERROR_MESSAGES.ACTIVE_SUBSCRIPTION_EXISTS)) {
        setErrorMessage(ERROR_MESSAGES.ACTIVE_SUBSCRIPTION_EXISTS);
      } else {
        setErrorMessage(ERROR_MESSAGES.SUBSCRIPTION_CREATION_FAILED);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="justify-center max-w-2xl mx-auto mt-4 mb-10">
      <form onSubmit={handleSubmit} className="px-4 ">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-12 mt-8 md:mt-10">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 md:mb-0">
            Checkout
          </h1>
          <div className="mb-4 md:mb-0">
            {/* Countdown component */}
            <ul className="flex space-x-2 bg-blue-50 w-[180px] justify-center rounded">
              <li className=" p-2 rounded text-center ">
                <span className="text-3xl">{minutes.toString()}</span>
                <p className="text-sm">Mins</p>
              </li>
              <li className="text-3xl flex items-center">:</li>
              <li className=" p-2 rounded text-center">
                <span className="text-3xl">
                  {seconds.toString().padStart(2, "0")}
                </span>
                <p className="text-sm">Secs</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <Label>Select Your Plan</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-2 mt-2">
            {pricingOptions.map((option) => {
              const discountedPrice = truncatedToTwoDecimalPlaces(
                (option.price as unknown as number) *
                  (1 - promoState.discount / 100)
              );
              return (
                <div
                  key={option.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedPlan?.id === option.id
                      ? "border-customDarkBlue bg-blue-50"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedPlan(option)}
                >
                  <div className="flex justify-between md:mb-4">
                    <h3 className="text-xl font-semibold">{option.tier}</h3>
                    {option.isFree ? (
                      <Badge className="bg-customDarkBlue text-white">
                        Free Trial
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-200">Full Access</Badge>
                    )}
                  </div>
                  {promoState.promoCodeApplied ? (
                    <div className="md:mb-1.5">
                      <p className="text-gray-600 line-through">
                        ${option.price}/month
                      </p>
                      <p className="text-gray-600 font-semibold">
                        ${discountedPrice as unknown as string}/month
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600 md:mb-1.5">
                      ${option.price}/month
                    </p>
                  )}
                  <p className="text-sm text-gray-500 md:mb-2">
                    {option.description}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-sm pl-1">
            Easily change or cancel your plan whenever you need.
          </p>
        </div>
        {/* Email input */}
        <div className="mb-8 md:flex-col md:flex">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="  md:mt-1"
          />
        </div>

        {/* promo input */}
        <div className="mb-8">
          <Label htmlFor="promoCode">Promo Code</Label>
          <div className="flex items-center">
            <Input
              id="promoCode"
              type="text"
              value={promoState.promoCode}
              onChange={(e) =>
                setPromoState((prevState) => ({
                  ...prevState,
                  promoCode: e.target.value,
                }))
              }
              placeholder="Enter promo code"
              className="md:w-[400px]"
              disabled={isPromoLoading}
            />

            <Button
              type="button"
              onClick={handleApplyPromoCode}
              variant="secondary"
              className="ml-4"
              // className="ml-2 border border-customPrimaryBlue text-customPrimaryBlue bg-transparent hover:bg-customPrimaryBlue hover:text-white transition-all duration-300"
            >
              {isPromoLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2"></span>
                  Applying...
                </>
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          {promoCodeError && (
            <p className="text-red-600 mt-2">{promoCodeError}</p>
          )}
          {promoState.promoCodeApplied && (
            <p className="text-green-600 mt-2">Promo code applied!</p>
          )}
        </div>

        <div className="mb-8">
          <Label>Payment Method</Label>
          <div className="flex space-x-4 mt-2">
            <div
              onClick={() => setSelectedPaymentMethod("card")}
              className={`cursor-pointer p-4 border rounded-lg flex flex-col items-center hover:bg-gray-50 w-[150px]  ${
                selectedPaymentMethod === "card"
                  ? "border-customDarkBlue bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <FaCreditCard size={24} className="mb-2" />
              <p>Credit Card</p>
            </div>
            <div
              onClick={() => setSelectedPaymentMethod("apple")}
              className={`cursor-pointer p-4 border rounded-lg flex flex-col items-center hover:bg-gray-50 w-[150px] ${
                selectedPaymentMethod === "apple"
                  ? "border-customDarkBlue bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <FaApple size={24} className="mb-2" />
              <p>Apple Pay</p>
            </div>
          </div>
        </div>
        {selectedPaymentMethod === "apple" && (
          <div className="mb-8">
            {canMakePayment ? (
              <Button
                type="button"
                onClick={() => paymentRequest?.show()}
                className="bg-black text-white w-full md:w-[250px] h-[50px] shadow-md font-semibold text-lg flex items-center mt-10"
              >
                <FaApple className="mr-2" size={24} />
                <p>Subscribe</p>
              </Button>
            ) : (
              <p className="text-red-600">
                Apple Pay is not available. Please select another payment
                method.
              </p>
            )}
          </div>
        )}

        {selectedPaymentMethod === "card" && (
          <>
            <div className="mb-4">
              <Label>Card Details</Label>
              <div
                className={`mt-2 pt-1 pb-2 border-b-2 text-gray-800 ${
                  cardError
                    ? "border-red-500"
                    : focused
                      ? "border-customDarkBlue"
                      : "border-gray-300"
                }`}
              >
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                      },
                    },
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onChange={(event) => {
                    if (event.error) {
                      setCardError(true);
                    } else {
                      setCardError(false);
                    }
                  }}
                />
              </div>
            </div>
            <div className="">
              <Button
                type="submit"
                disabled={!stripe || loading}
                className="w-full md:w-[250px] mt-8 mb-10 h-[50px] font-semibold text-lg py-1"
              >
                {loading ? "Processing..." : "Subscribe"}
              </Button>
            </div>
          </>
        )}

        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
      </form>
    </main>
  );
};

export default PaymentForm;
