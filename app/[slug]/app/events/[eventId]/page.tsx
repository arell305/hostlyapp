"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import EventIdContent from "./EventIdContent";
import { Button } from "@/components/ui/button";
import FullLoading from "../../components/loading/FullLoading";
import ErrorComponent from "../../components/errors/ErrorComponent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { ResponseStatus } from "@/types/enums";

export default function EventPageWrapper() {
  const { has } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { user } = useUser();
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
  console.log(user);

  if (!data.event.isActive) {
    return (
      <div className="mt-10 flex flex-col items-center md:items-start text-center md:ml-10">
        <p>This event has been deleted.</p>
        <Button className="w-[100px] mt-2" onClick={handleNavigateHome}>
          Home
        </Button>
      </div>
    );
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
