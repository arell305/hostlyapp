"use client";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import { useQuery } from "convex/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import { FrontendErrorMessages, ResponseStatus } from "@/types/enums";
import EventContent from "./EventContent";
import { useUser } from "@clerk/nextjs";
import HomeNav from "@/[slug]/app/components/nav/HomeNav";

const EventPage = () => {
  const { isStripeEnabled, connectedAccountStripeId } =
    useContextPublicOrganization();

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });
  const { user } = useUser();

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

  if (getEventByIdResponse === undefined || user === undefined) {
    return <FullLoading />;
  }

  if (getEventByIdResponse.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={getEventByIdResponse.error} />;
  }
  const eventData = getEventByIdResponse?.data?.event;
  const ticketInfoData = getEventByIdResponse?.data?.ticketInfo;
  return (
    <main className="bg-gray-100 min-h-screen flex  overflow-hidden flex-col items-center">
      <HomeNav
        user={user}
        handleNavigateHome={handleBrowseMoreEvents}
        buttonText="Back to Events"
      />
      <EventContent
        isStripeEnabled={isStripeEnabled}
        connectedAccountStripeId={connectedAccountStripeId}
        stripePromise={stripePromise}
        eventData={eventData}
        ticketInfoData={ticketInfoData}
        onBrowseMoreEvents={handleBrowseMoreEvents}
      />
    </main>
  );
};

export default EventPage;
