"use client";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import { useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import ProfileBanner from "@/components/shared/company/ProfileBanner";
import { ArrowLeft } from "lucide-react";
import HomeNav from "@/[slug]/app/components/nav/HomeNav";
import NProgress from "nprogress";
import EventContentWrapper from "./components/EventCheckoutWrapper";

const EventPage = () => {
  const { name, photo, isStripeEnabled, connectedAccountStripeId } =
    useContextPublicOrganization();

  const pathname = usePathname();
  const router = useRouter();

  const displayCompanyPhoto = useQuery(
    api.photo.getFileUrl,
    photo ? { storageId: photo } : "skip"
  );

  let stripePromise: Promise<Stripe | null> = Promise.resolve(null);

  const handleBrowseMoreEvents = () => {
    const slug = pathname.split("/")[1];
    const newUrl = `/${slug}`;
    NProgress.start();
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

  return (
    <div>
      <HomeNav />
      <main className="pb-10">
        <div className="px-4 mt-2">
          <button
            onClick={handleBrowseMoreEvents}
            className="text-sm  flex items-center gap-1 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
        </div>
        <ProfileBanner
          className="px-4"
          displayPhoto={displayCompanyPhoto}
          name={name}
        />

        <EventContentWrapper
          isStripeEnabled={isStripeEnabled}
          connectedAccountStripeId={connectedAccountStripeId}
          stripePromise={stripePromise}
          onBrowseMoreEvents={handleBrowseMoreEvents}
        />
      </main>
    </div>
  );
};

export default EventPage;
