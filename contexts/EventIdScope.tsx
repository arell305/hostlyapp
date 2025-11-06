"use client";

import { createContext } from "react";
import type { Id } from "convex/_generated/dataModel";

export type EventIdScope = { eventId: Id<"events"> };

export const EventIdScopeContext = createContext<EventIdScope | null>(null);

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
