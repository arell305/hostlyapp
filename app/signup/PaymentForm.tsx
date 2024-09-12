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

// Load Stripe with your publishable key
const stripePromise = loadStripe("pk_test_XXXXXXXXXXXXXXXXXXXXXXXX");

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [priceId, setPriceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null
  );
  const [canMakePayment, setCanMakePayment] = useState(true);

  const pricingOptions = [
    {
      id: "price_1XX_STANDARD",
      name: "Basic",
      price: "$20/month",
      description: "Unlimited Tickets",
      isFree: true,
    },
    {
      id: "price_1XX_PRO",
      name: "Plus",
      price: "$30/month",
      description: "Unlimited Tickets & 1 Guest List Event",
      isFree: true,
    },
    {
      id: "price_1XX_ENTERPRISE",
      name: "Elite",
      price: "$40/month",
      description: "Unlimited Tickets & Guest List",
      isFree: false,
    },
  ];

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Total",
          amount: 1000, // Replace with actual total amount (in cents)
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
          setCanMakePayment(true);
        }
      });

      pr.on("paymentmethod", async (ev) => {
        setLoading(true);
        const response = await fetch("/api/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: ev.payerEmail,
            paymentMethodId: ev.paymentMethod.id,
            priceId,
          }),
        });

        const subscriptionResult = await response.json();

        if (subscriptionResult.error) {
          ev.complete("fail");
          setErrorMessage(
            subscriptionResult.error.message || "Subscription failed."
          );
        } else {
          ev.complete("success");
          alert("Subscription successful! Check your email for confirmation.");
        }

        setLoading(false);
      });
    }
  }, [stripe, priceId]);

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

    // Send payment method and plan ID to backend to handle subscription
    const response = await fetch("/api/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        paymentMethodId: paymentMethod.id,
        priceId,
      }),
    });

    const subscriptionResult = await response.json();

    if (subscriptionResult.error) {
      setErrorMessage(
        subscriptionResult.error.message || "Subscription failed."
      );
    } else {
      alert("Subscription successful! Check your email for confirmation.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-3xl md:text-4xl font-semibold mb-4 mt-4">Checkout</h1>

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
          className="md:w-[400px] text-base"
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
                priceId === option.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
              onClick={() => setPriceId(option.id)}
            >
              <div className="flex justify-between">
                <h3 className="text-xl font-semibold">{option.name}</h3>
                {option.isFree && (
                  <Badge className="bg-customDarkBlue">1st Month Free</Badge>
                )}
              </div>
              <p className="text-gray-600">{option.price}</p>
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
            className="bg-black text-white w-full md:w-[200px]"
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
                  fontSize: "16px", // Setting the font size to 16px
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
          className="w-full bg-customLightBlue font-semibold  hover:bg-customDarkerBlue  md:w-[200px] text-black"
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
