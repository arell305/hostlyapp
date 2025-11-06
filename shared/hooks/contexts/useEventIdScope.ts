import { EventIdScope, EventIdScopeContext } from "@/contexts/EventIdScope";
import { useContext } from "react";

export function useEventIdScope(): EventIdScope {
  const context = useContext(EventIdScopeContext);
  if (!context) {
    throw new Error("EventIdScopeProvider missing");
  }

  return context;
}
