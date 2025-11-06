"use client";
import { createContext, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import FullLoading from "@shared/ui/loading/FullLoading";
import MessagePage from "@shared/ui/shared-page/MessagePage";
import type { EventWithTicketTypes } from "@shared/types/schemas-types";
import type { TicketSoldCountByType } from "@shared/types/types";
import { Doc, Id } from "convex/_generated/dataModel";

export type EventContextType = {
  event: EventWithTicketTypes;
  guestListInfo: Doc<"guestListInfo"> | null;
  ticketSoldCounts: TicketSoldCountByType[] | null;
  ticketTypes: Doc<"eventTicketTypes">[];
};

export const EventContext = createContext<EventContextType | undefined>(
  undefined
);

export const EventProvider: React.FC<{
  eventId: Id<"events">;
  children: React.ReactNode;
}> = ({ children, eventId }) => {
  const eventResponse = useQuery(api.events.getEventById, { eventId });

  const activeTicketTypes = useMemo<Doc<"eventTicketTypes">[]>(
    () =>
      (eventResponse?.ticketTypes ?? []).filter(
        (ticketType) => ticketType.isActive === true
      ),
    [eventResponse?.ticketTypes]
  );

  const eventWithTicketTypes: EventWithTicketTypes | null = useMemo(() => {
    const eventDoc = eventResponse?.event;

    if (!eventDoc) {
      return null;
    }

    return {
      ...eventDoc,
      ticketTypes: activeTicketTypes,
    };
  }, [eventResponse, activeTicketTypes]);

  const guestListInfo: Doc<"guestListInfo"> | null =
    eventResponse?.guestListInfo ?? null;

  const ticketSoldCounts: TicketSoldCountByType[] | null =
    eventResponse?.ticketSoldCounts ?? null;

  const contextValue: EventContextType | null = useMemo(() => {
    if (!eventWithTicketTypes) {
      return null;
    }

    return {
      event: eventWithTicketTypes,
      guestListInfo,
      ticketSoldCounts,
      ticketTypes: activeTicketTypes,
    };
  }, [
    eventWithTicketTypes,
    guestListInfo,
    ticketSoldCounts,
    activeTicketTypes,
  ]);

  if (!eventResponse) {
    return <FullLoading />;
  }

  if (!contextValue) {
    return (
      <MessagePage
        title="Event not found"
        description="We could not find this event. It may have been removed or the link is incorrect."
      />
    );
  }

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};
