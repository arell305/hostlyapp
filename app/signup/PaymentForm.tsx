"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FaApple } from "react-icons/fa";
import { pricingOptions } from "../../constants/pricingOptions";
import { useSearchParams } from "next/navigation";
import { useTimer } from "react-timer-hook";
import { getPricingOptionByName } from "../../utils/helpers";
import { api } from "../../convex/_generated/api";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { PricingOption } from "@/types";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const CheckoutForm = () => {
  const searchParams = useSearchParams();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const createStripeSubscription = useAction(
    api.stripe.createStripeSubscription
  );
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PricingOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null
  );
  const [canMakePayment, setCanMakePayment] = useState(true);

  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 600);

  const { seconds, minutes, hours } = useTimer({
    expiryTimestamp,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Ensure this runs only on the client side
      const queryPlan = searchParams.get("plan");
      const plan = getPricingOptionByName(queryPlan);
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  // useEffect(() => {
  //   if (!stripe || !selectedPlan) {
  //     return;
  //   }

  //   // Convert price from string to number (cents)
  //   const amount = parseFloat(selectedPlan.price) * 100; // Convert dollars to cents

  //   if (isNaN(amount)) {
  //     console.error("Invalid price amount.");
  //     return;
  //   }

  //   const pr = stripe.paymentRequest({
  //     country: "US",
  //     currency: "usd",
  //     total: {
  //       label: "Total",
  //       amount: Math.round(amount), // Ensure amount is an integer
  //     },
  //     requestPayerName: true,
  //     requestPayerEmail: true,
  //   });

  //   pr.canMakePayment().then((result) => {
  //     if (result) {
  //       setPaymentRequest(pr as unknown as PaymentRequest);
  //       setCanMakePayment(true);
  //     }
  //   });

  //   pr.on("paymentmethod", async (ev) => {
  //     setLoading(true);

  //     const response = await fetch("/api/create-subscription", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         email: ev.payerEmail,
  //         paymentMethodId: ev.paymentMethod.id,
  //         priceId: selectedPlan.priceId,
  //       }),
  //     });

  //     const subscriptionResult = await response.json();

  //     if (subscriptionResult.error) {
  //       ev.complete("fail");
  //       setErrorMessage(
  //         subscriptionResult.error.message || "Subscription failed."
  //       );
  //     } else {
  //       ev.complete("success");
  //       alert("Subscription successful! Check your email for confirmation.");
  //     }

  //     setLoading(false);
  //   });
  // }, [stripe, selectedPlan]);

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
      setErrorMessage(error.message || "An error occurred. Please try again.");
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
      });

      if (result && result.subscriptionId) {
        router.push("/after-sign-up");
      } else {
        setErrorMessage("Failed to create subscription. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-3xl md:text-4xl font-semibold mb-4 mt-4">Checkout</h1>
      <div className="mb-2">
        <p>Free Trial ends:</p>

        <ul className="flex ">
          <li className="inline-block p-2 text-center list-none">
            <span className="block text-3xl text-center bg-blue-50 w-[70px] py-1 rounded-md">
              {minutes.toString().padStart(2, "0")}
            </span>
            Mins{" "}
          </li>
          <li className="text-3xl py-2">:</li>
          <li className="inline-block p-2 text-center list-none">
            <span className="block text-3xl text-center bg-blue-50 w-[70px] py-1 rounded-md">
              {seconds.toString().padStart(2, "0")}
            </span>
            Secs
          </li>
        </ul>
      </div>
      {/* Email input */}
      <div className="mb-4">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          className="md:w-[400px] text-base "
        />
      </div>

      {/* Pricing options */}
      <div className="mb-4">
        <Label>Select Your Plan</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {pricingOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedPlan?.id === option.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
              onClick={() => setSelectedPlan(option)}
            >
              <div className="flex justify-between">
                <h3 className="text-xl font-semibold">{option.name}</h3>
                {option.isFree ? (
                  <Badge className="bg-customDarkBlue">Free Trial</Badge>
                ) : (
                  <Badge className="bg-customPrimaryBlue">Full Access</Badge>
                )}
              </div>
              <p className="text-gray-600">${option.price}/month</p>
              <p className="text-sm text-gray-500">{option.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm">
          Easily change or cancel your plan whenever you need.
        </p>
      </div>

      {/* Payment Request Button (Apple Pay) */}
      {canMakePayment && (
        <div className="mb-4">
          <Button
            type="button"
            onClick={() => {
              paymentRequest?.show();
            }}
            className="bg-black text-white w-full md:w-[200px] shadow-md"
          >
            <FaApple className="mr-2" size={20} />
            Pay
          </Button>
        </div>
      )}
      <hr className="my-4" />
      {/* Credit card input */}
      <div className="mb-4">
        <Label>Card Details</Label>
        <div className="p-2 border rounded md:w-[400px] ">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Submit button */}
      <div className="mb-4">
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="shadow-md w-full bg-customLightBlue font-semibold  hover:bg-customDarkerBlue  md:w-[200px] text-black"
        >
          {loading ? "Processing..." : "Subscribe"}
        </Button>
      </div>

      {/* Error message */}
      {errorMessage && <div className="text-red-600">{errorMessage}</div>}
    </form>
  );
};

const PaymentForm = () => {
  return (
    <div className="bg-white py-2 md:py-10 px-10 rounded-xl shadow-md sm:mx-4 my-6 sm:my-0 mx-6">
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default PaymentForm;
