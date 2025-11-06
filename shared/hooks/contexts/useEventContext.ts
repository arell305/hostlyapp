import { EventContext } from "@/contexts/EventContext";
import { useContext } from "react";

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventContext must be used within EventProvider");
  }
  return context;
};
