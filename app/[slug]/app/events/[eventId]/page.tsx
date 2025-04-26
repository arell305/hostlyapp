"use client";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import EventIdContent from "./EventIdContent";
import FullLoading from "../../components/loading/FullLoading";
import ErrorComponent from "../../components/errors/ErrorComponent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { ResponseStatus } from "@/types/enums";
import EventDeleted from "../components/EventDeleted";

export default function EventPageWrapper() {
  const { has } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const {
    organization,
    organizationContextError,
    connectedAccountEnabled,
    subscription,
  } = useContextOrganization();

  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  const isAppAdmin = organization?.slug === "admin";

  const handleNavigateHome = () => {
    if (organization?.slug) {
      router.push(`/${organization.slug}/app/`);
    }
  };

  if (
    !getEventByIdResponse ||
    !organization ||
    !subscription ||
    connectedAccountEnabled === undefined ||
    !has
  ) {
    return <FullLoading />;
  }

  if (getEventByIdResponse.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={getEventByIdResponse.error} />;
  }

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  const data = getEventByIdResponse.data;

  if (!data.event.isActive) {
    return <EventDeleted onBack={handleNavigateHome} />;
  }

  return (
    <EventIdContent
      data={data}
      isAppAdmin={isAppAdmin}
      has={has}
      isStripeEnabled={connectedAccountEnabled}
      organization={organization}
      subscription={subscription}
      handleNavigateHome={handleNavigateHome}
    />
  );
}
