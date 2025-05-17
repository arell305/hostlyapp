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
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const {
    organization,
    organizationContextError,
    connectedAccountEnabled,
    subscription,
  } = useContextOrganization();
  if (
    subscription === undefined ||
    organization === undefined ||
    connectedAccountEnabled === undefined ||
    !user
  ) {
    return <FullLoading />;
  }

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  const orgRole = user?.publicMetadata.role as string;
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
