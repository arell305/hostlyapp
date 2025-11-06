"use client";
import { usePathname, useRouter } from "next/navigation";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import ProfileBanner from "@shared/ui/company/ProfileBanner";
import { ArrowLeft } from "lucide-react";
import HomeNav from "@shared/ui/nav/HomeNav";
import NProgress from "nprogress";
import EventContentWrapper from "@/features/customerEvents/components/EventCheckoutWrapper";
import { useContextPublicOrganization } from "@/shared/hooks/contexts";

const EventsPage = () => {
  const { organizationPublic } = useContextPublicOrganization();
  const { name, photoUrl, isStripeEnabled, connectedAccountStripeId } =
    organizationPublic;

  const pathname = usePathname();
  const router = useRouter();

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
        <ProfileBanner className="px-4" displayPhoto={photoUrl} name={name} />

        <EventContentWrapper
          isStripeEnabled={isStripeEnabled}
          connectedAccountStripeId={connectedAccountStripeId ?? null}
          stripePromise={stripePromise}
          onBrowseMoreEvents={handleBrowseMoreEvents}
        />
      </main>
    </div>
  );
};

export default EventsPage;
