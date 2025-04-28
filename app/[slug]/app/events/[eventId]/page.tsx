"use client";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import EventIdContent from "./EventIdContent";
import FullLoading from "../../components/loading/FullLoading";
import ErrorComponent from "../../components/errors/ErrorComponent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { ClerkPermissions, ResponseStatus } from "@/types/enums";
import EventDeleted from "../components/EventDeleted";
import { GetEventWithGuestListsData } from "@/types/convex-types";

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

  const responseTickets = useQuery(
    api.tickets.getTicketsByEventId,
    getEventByIdResponse?.data?.event._id
      ? {
          eventId: getEventByIdResponse?.data.event._id,
        }
      : "skip"
  );

  const responseGuestList = useQuery(
    api.events.getEventWithGuestLists,
    getEventByIdResponse?.data?.event._id
      ? {
          eventId: getEventByIdResponse?.data.event._id,
        }
      : "skip"
  );
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
    !has ||
    responseTickets === undefined ||
    responseGuestList === undefined
  ) {
    return <FullLoading />;
  }

  if (getEventByIdResponse.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={getEventByIdResponse.error} />;
  }

  if (responseTickets.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={responseTickets.error} />;
  }

  if (responseGuestList.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={responseGuestList.error} />;
  }

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  const data = getEventByIdResponse.data;
  const tickets = responseTickets.data?.tickets;
  const guestListData: GetEventWithGuestListsData = responseGuestList.data;
  const canCheckInGuests: boolean = has({
    permission: ClerkPermissions.CHECK_GUESTS,
  });
  const canUploadGuest: boolean = has({
    permission: ClerkPermissions.UPLOAD_GUESTLIST,
  });

  if (!data.event.isActive) {
    return <EventDeleted onBack={handleNavigateHome} />;
  }

  return (
    <EventIdContent
      data={data}
      isAppAdmin={isAppAdmin}
      isStripeEnabled={connectedAccountEnabled}
      organization={organization}
      subscription={subscription}
      handleNavigateHome={handleNavigateHome}
      tickets={tickets}
      canCheckInGuests={canCheckInGuests}
      canUploadGuest={canUploadGuest}
      guestListData={guestListData}
    />
  );
}
