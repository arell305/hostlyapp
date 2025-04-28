"use client";
import { useAuth } from "@clerk/nextjs";
import FullLoading from "./components/loading/FullLoading";
import ErrorComponent from "./components/errors/ErrorComponent";
import { SubscriptionTier } from "@/types/enums";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import HomeContent from "./HomeContent";
import { canCreateEvent } from "../../../utils/permissions";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const HomePage: React.FC = () => {
  const { orgRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const {
    organization,
    organizationContextError,
    connectedAccountEnabled,
    subscription,
  } = useContextOrganization();

  if (
    !subscription ||
    !organization ||
    connectedAccountEnabled === undefined ||
    !orgRole
  ) {
    return <FullLoading />;
  }

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  const handleAddEventClick = () => {
    router.push(`${pathname}/add-event`);
  };

  const canCreateEvents = canCreateEvent(orgRole);
  const showStripeNotification = !connectedAccountEnabled && canCreateEvents;
  const showPlusTierData =
    subscription.subscriptionTier === SubscriptionTier.PLUS && canCreateEvents;

  return (
    <HomeContent
      organization={organization}
      canCreateEvents={canCreateEvents}
      showPlusTierData={showPlusTierData}
      showStripeNotification={showStripeNotification}
      subscription={subscription}
      handleAddEventClick={handleAddEventClick}
    />
  );
};

export default HomePage;
