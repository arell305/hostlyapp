"use client";
import { useUser } from "@clerk/nextjs";
import FullLoading from "./components/loading/FullLoading";
import ErrorComponent from "./components/errors/ErrorComponent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import HomeContent from "./HomeContent";
import { canCreateEvent } from "../../../utils/permissions";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const HomePage: React.FC = () => {
  const pathname = usePathname();

  const {
    organization,
    organizationContextError,
    connectedAccountEnabled,
    subscription,
    orgRole,
  } = useContextOrganization();
  if (
    subscription === undefined ||
    organization === undefined ||
    connectedAccountEnabled === undefined
  ) {
    return <FullLoading />;
  }

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  const canCreateEvents = canCreateEvent(orgRole);

  const showStripeNotification = !connectedAccountEnabled && canCreateEvents;

  return (
    <HomeContent
      organization={organization}
      canCreateEvents={canCreateEvents}
      showStripeNotification={showStripeNotification}
      pathname={pathname}
    />
  );
};

export default HomePage;
