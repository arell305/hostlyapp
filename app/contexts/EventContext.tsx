"use client";
import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "convex/_generated/api";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import MessagePage from "@/components/shared/shared-page/MessagePage";
import type { EventWithTicketTypes } from "@/types/schemas-types";
import type { TicketSoldCountByType } from "@/types/types";
import { Doc } from "convex/_generated/dataModel";

type EventContextType = {
  event: EventWithTicketTypes;
  guestListInfo: Doc<"guestListInfo"> | null;
  ticketSoldCounts: TicketSoldCountByType[] | null;
  ticketTypes: Doc<"eventTicketTypes">[];
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { eventId } = useParams();
  const eventIdStr = typeof eventId === "string" ? eventId : "";

  // Always call hooks in the same order
  const response = useQuery(
    api.events.getEventById,
    eventIdStr ? { eventId: eventIdStr } : "skip"
  );

  // Build ALL derived values (useMemo is a hook!) BEFORE any return
  const ticketTypes = useMemo<Doc<"eventTicketTypes">[]>(
    () => (response?.ticketTypes ?? []).filter((t) => t.isActive === true),
    [response?.ticketTypes]
  );
  const eventWithTicketTypes: EventWithTicketTypes | null = useMemo(() => {
    const ev = response?.event;
    return ev ? { ...ev, ticketTypes } : null;
  }, [response, ticketTypes]);

  const guestListInfo: Doc<"guestListInfo"> | null =
    response?.guestListInfo ?? null;
  const ticketSoldCounts: TicketSoldCountByType[] | null =
    response?.ticketSoldCounts ?? null;

  const contextValue: EventContextType | null = useMemo(() => {
    if (!eventWithTicketTypes) return null;
    return {
      event: eventWithTicketTypes,
      guestListInfo,
      ticketSoldCounts,
      ticketTypes,
    };
  }, [eventWithTicketTypes, guestListInfo, ticketSoldCounts, ticketTypes]);

  if (response === undefined) {
    return <FullLoading />;
  }

  if (!contextValue) {
    return (
      <MessagePage
        title="Event not found"
        description="We couldn’t find this event. It may have been removed or the link is incorrect."
      />
    );
  }

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const ctx = useContext(EventContext);
  if (!ctx)
    throw new Error("useEventContext must be used within EventProvider");
  return ctx;
};
