"use client";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import { useQuery } from "convex/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import { FrontendErrorMessages } from "@/types/enums";
import { ResponseStatus } from "../../../../utils/enum";
import EventContent from "./EventContent";

const EventPage = () => {
  const { isStripeEnabled, connectedAccountStripeId } =
    useContextPublicOrganization();

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  let stripePromise: Promise<Stripe | null> = Promise.resolve(null);

  const handleBrowseMoreEvents = () => {
    const slug = pathname.split("/")[1];
    const newUrl = `/${slug}`;
    router.push(newUrl);
  };

  if (connectedAccountStripeId) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
      {
        stripeAccount: connectedAccountStripeId,
      }
    );
  }

  const eventData = getEventByIdResponse?.data?.event;
  const ticketInfoData = getEventByIdResponse?.data?.ticketInfo;

  if (!getEventByIdResponse || !eventData) {
    return <FullLoading />;
  }

  if (getEventByIdResponse.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={FrontendErrorMessages.GENERIC_ERROR} />;
  }

  return (
    <EventContent
      isStripeEnabled={isStripeEnabled}
      connectedAccountStripeId={connectedAccountStripeId}
      stripePromise={stripePromise}
      eventData={eventData}
      ticketInfoData={ticketInfoData}
      onBrowseMoreEvents={handleBrowseMoreEvents}
    />
  );
};

export default EventPage;
