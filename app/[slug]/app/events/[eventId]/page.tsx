"use client";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus } from "../../../../../utils/enum";
import EventIdContent from "./EventIdContent";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FullLoading from "../../components/loading/FullLoading";
import ErrorComponent from "../../components/errors/ErrorComponent";
import { useContextOrganization } from "@/contexts/OrganizationContext";

export default function EventPageWrapper() {
  const { has } = useAuth();
  const params = useParams();
  const eventId = params.eventId as string;

  const {
    organization,
    organizationContextError,
    connectedAccountEnabled,
    subscription,
  } = useContextOrganization();

  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  const isAppAdmin = organization?.slug === "admin";

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
    return (
      <div className="mt-10 flex flex-col items-center md:items-start text-center md:ml-10">
        <p>This event has been deleted.</p>
        <Link href={`/${organization.slug}/app/`}>
          <Button className="w-[100px] mt-2">Home</Button>
        </Link>
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
    />
  );
}
