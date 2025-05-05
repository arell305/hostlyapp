"use client";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import { useQuery } from "convex/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import { ResponseStatus } from "@/types/enums";
import EventContent from "./EventContent";
import { useUser } from "@clerk/nextjs";
import EventsPageNav from "@/[slug]/app/components/nav/EventsPageNav";
import ProfileBanner from "@/components/shared/company/ProfileBanner";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import { ArrowLeft } from "lucide-react";
import HomeNav from "@/[slug]/app/components/nav/HomeNav";

const EventPage = () => {
  const { name, photo, isStripeEnabled, connectedAccountStripeId } =
    useContextPublicOrganization();

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });
  const { user } = useUser();

  const displayCompanyPhoto = useQuery(
    api.photo.getFileUrl,
    photo ? { storageId: photo } : "skip"
  );

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

  if (
    getEventByIdResponse === undefined ||
    user === undefined ||
    name === undefined
  ) {
    return <FullLoading />;
  }

  if (getEventByIdResponse.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={getEventByIdResponse.error} />;
  }
  const eventData = getEventByIdResponse?.data?.event;
  const ticketInfoData = getEventByIdResponse?.data?.ticketInfo;
  const ticketSoldCounts = getEventByIdResponse?.data?.ticketSoldCounts;
  return (
    <div>
      <HomeNav user={user} handleNavigateHome={handleBrowseMoreEvents} />

      <main>
        <div className="px-4 mt-2">
          <button
            onClick={handleBrowseMoreEvents}
            className="text-sm text-primaryBlue flex items-center gap-1 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
        </div>
        <ProfileBanner displayPhoto={displayCompanyPhoto} name={name} />

        <EventContent
          isStripeEnabled={isStripeEnabled}
          connectedAccountStripeId={connectedAccountStripeId}
          stripePromise={stripePromise}
          eventData={eventData}
          ticketInfoData={ticketInfoData}
          onBrowseMoreEvents={handleBrowseMoreEvents}
          ticketSoldCounts={ticketSoldCounts}
        />
      </main>
    </div>
  );
};

export default EventPage;
