"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import EventIdContent from "./EventIdContent";
import FullLoading from "../../components/loading/FullLoading";
import ErrorComponent from "../../components/errors/ErrorComponent";
import { QueryState, ResponseStatus } from "@/types/enums";
import {
  GetEventByIdData,
  GetEventWithGuestListsData,
} from "@/types/convex-types";
import MessagePage from "@/components/shared/shared-page/MessagePage";
import { Id } from "convex/_generated/dataModel";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import {
  SubscriptionSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import { OrganizationSchema } from "@/types/types";
interface PromoterEventIdPageProps {
  eventId: Id<"events">;
  handleNavigateHome: () => void;
  canCheckInGuests: boolean;
  canUploadGuest: boolean;
  canEditEvent: boolean;
  handleAddGuestList: () => void;
  subscription: SubscriptionSchema;
  organization: OrganizationSchema;
  isAppAdmin: boolean;
  isStripeEnabled: boolean;
  data: GetEventByIdData;
}

export default function PromoterEventIdPage({
  eventId,
  handleNavigateHome,
  canCheckInGuests,
  canUploadGuest,
  canEditEvent,
  handleAddGuestList,
  subscription,
  organization,
  isAppAdmin,
  isStripeEnabled,
  data,
}: PromoterEventIdPageProps) {
  const responseTickets = useQuery(api.tickets.getTicketsByEventId, {
    eventId: eventId as Id<"events">,
  });

  const responseGuestList = useQuery(
    api.guestListEntries.getEventWithGuestLists,
    {
      eventId: eventId as Id<"events">,
    }
  );

  const ticketResult = handleQueryState(responseTickets);
  const guestListResult = handleQueryState(responseGuestList);

  if (
    ticketResult.type === QueryState.Loading ||
    guestListResult.type === QueryState.Loading
  ) {
    return <FullLoading />;
  }

  if (ticketResult.type === QueryState.Error) {
    return ticketResult.element;
  }

  if (guestListResult.type === QueryState.Error) {
    return guestListResult.element;
  }

  const tickets: TicketSchemaWithPromoter[] = ticketResult.data.tickets;
  const guestListData: GetEventWithGuestListsData = guestListResult.data;

  return (
    <EventIdContent
      data={data}
      isAppAdmin={isAppAdmin}
      isStripeEnabled={isStripeEnabled}
      organization={organization}
      subscription={subscription}
      handleNavigateHome={handleNavigateHome}
      tickets={tickets}
      canCheckInGuests={canCheckInGuests}
      canUploadGuest={canUploadGuest}
      guestListData={guestListData}
      canEditEvent={canEditEvent}
      handleAddGuestList={handleAddGuestList}
    />
  );
}
