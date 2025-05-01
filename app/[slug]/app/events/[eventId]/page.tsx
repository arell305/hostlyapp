"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import EventIdContent from "./EventIdContent";
import FullLoading from "../../components/loading/FullLoading";
import ErrorComponent from "../../components/errors/ErrorComponent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { ResponseStatus } from "@/types/enums";
import EventDeleted from "../components/EventDeleted";
import { GetEventWithGuestListsData } from "@/types/convex-types";
import { isModerator, isPromoter } from "@/utils/permissions";

export default function EventPageWrapper() {
  const { user } = useUser();
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
    !user ||
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

  const orgRole = user?.publicMetadata.role as string;
  const canCheckInGuests = isModerator(orgRole);
  const canUploadGuest = isPromoter(orgRole);

  const data = getEventByIdResponse.data;
  const tickets = responseTickets.data?.tickets;
  const guestListData: GetEventWithGuestListsData = responseGuestList.data;

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
