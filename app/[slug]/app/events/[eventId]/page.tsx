"use client";
import EventInfoSkeleton from "@/[slug]/app/components/loading/EventInfoSkeleton";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus } from "../../../../../utils/enum";
import NotFound from "@/[slug]/app/components/errors/NotFound";
import ErrorFetch from "@/[slug]/app/components/errors/ErrorFetch";
import EventIdContent from "./EventIdContent";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useIsStripeEnabled } from "@/hooks/useIsStripeEnabled";

export default function EventPageWrapper() {
  const { has } = useAuth();
  const params = useParams();
  const eventId = params.eventId as string;

  const { user, organization } = useClerk();
  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  const isAppAdmin = organization?.slug === "admin";

  const { companyName: companyNameParams } = useParams();
  const cleanCompanyName =
    typeof companyNameParams === "string"
      ? companyNameParams.split("?")[0].toLowerCase()
      : "";
  const { isStripeEnabled } = useIsStripeEnabled({
    companyName: cleanCompanyName,
  });

  if (!user || !has) {
    return <EventInfoSkeleton />;
  }

  if (getEventByIdResponse === undefined) {
    return <EventInfoSkeleton />;
  }

  if (getEventByIdResponse.status === ResponseStatus.ERROR) {
    return <ErrorFetch text={"event"} message={getEventByIdResponse.error} />;
  }

  // Ensure that data, isAppAdmin, and organization are all truthy
  const data = getEventByIdResponse.data;

  if (!data || !organization) {
    return <NotFound text={"event"} />; // Or handle it in another way
  }

  if (!data.event.isActive) {
    return (
      <div className="mt-10 flex flex-col items-center md:items-start text-center md:ml-10">
        <p>This event has been deleted.</p>
        <Link href={`/${cleanCompanyName}/app/home`}>
          <Button className="w-[100px] mt-2">Home</Button>
        </Link>
      </div>
    );
  }
  // Final return with all required props
  return (
    <EventIdContent
      data={data}
      isAppAdmin={isAppAdmin}
      organization={organization}
      user={user}
      has={has}
      isStripeEnabled={isStripeEnabled}
      companyName={cleanCompanyName}
    />
  );
}
