"use client";

import { createContext, useContext } from "react";
import type { Id } from "convex/_generated/dataModel";

type EventIdScope = { eventId: Id<"events"> };

const EventIdScopeContext = createContext<EventIdScope | null>(null);

export function EventIdScopeProvider({
  eventId,
  children,
}: {
  eventId: Id<"events">;
  children: React.ReactNode;
}) {
  return (
    <EventIdScopeContext.Provider value={{ eventId }}>
      {children}
    </EventIdScopeContext.Provider>
  );
}

export function useEventIdScope(): EventIdScope {
  const context = useContext(EventIdScopeContext);
  if (!context) {
    throw new Error("EventIdScopeProvider missing");
  }

  return context;
}
