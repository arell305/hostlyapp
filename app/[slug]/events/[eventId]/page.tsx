"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import EventWrapper from "./EventWrapper";
import { useParams } from "next/navigation";
import { useIsStripeEnabled } from "@/hooks/useIsStripeEnabled";

const page = () => {
  const params = useParams();
  const companyName = params.companyName as string;

  const { isStripeEnabled, connectedAccountData } = useIsStripeEnabled({
    companyName,
  });

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
    {
      stripeAccount:
        connectedAccountData?.data?.connectedAccount.stripeAccountId,
    }
  );
  console.log(
    "stripeid",
    connectedAccountData?.data?.connectedAccount.stripeAccountId
  );
  return <EventWrapper />;
};

export default page;
