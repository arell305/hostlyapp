import {
  EventFormContext,
  EventFormContextType,
} from "@/contexts/EventFormContext";
import { useContext } from "react";

export const useEventForm = (): EventFormContextType => {
  const context = useContext(EventFormContext);
  if (!context) {
    throw new Error("useEventForm must be used within an EventFormProvider");
  }
  return context;
};
