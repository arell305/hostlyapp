"use client";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus } from "../../../../../utils/enum";
import EventIdContent from "./EventIdContent";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useIsStripeEnabled } from "@/hooks/useIsStripeEnabled";
import FullLoading from "../../components/loading/FullLoading";
import ErrorComponent from "../../components/errors/ErrorComponent";

export default function EventPageWrapper() {
  const { has } = useAuth();
  const params = useParams();
  const eventId = params.eventId as string;

  const { user, organization } = useClerk();
  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  const userResponse = useQuery(api.users.getUserByClerkId);

  const isAppAdmin = organization?.slug === "admin";

  const { slug } = useParams();
  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  const { isStripeEnabled, isLoading, connectedAccountError } =
    useIsStripeEnabled({
      slug: cleanSlug,
    });

  if (!getEventByIdResponse || isLoading || !user || !has || !userResponse) {
    return <FullLoading />;
  }

  if (getEventByIdResponse.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={getEventByIdResponse.error} />;
  }

  if (userResponse.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={userResponse.error} />;
  }

  if (connectedAccountError) {
    return <ErrorComponent message={connectedAccountError} />;
  }

  const data = getEventByIdResponse.data;

  if (!data.event.isActive) {
    return (
      <div className="mt-10 flex flex-col items-center md:items-start text-center md:ml-10">
        <p>This event has been deleted.</p>
        <Link href={`/${cleanSlug}/app/`}>
          <Button className="w-[100px] mt-2">Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <EventIdContent
      data={data}
      isAppAdmin={isAppAdmin}
      user={userResponse.data.user}
      has={has}
      isStripeEnabled={isStripeEnabled}
      slug={cleanSlug}
    />
  );
}
