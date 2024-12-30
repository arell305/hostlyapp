"use client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SubscriptionContent from "./SubscriptionContent";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const SubscriptionPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionContent />
    </Elements>
  );
};

export default SubscriptionPage;
