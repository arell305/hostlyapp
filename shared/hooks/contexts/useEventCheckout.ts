import { EventCheckoutContext } from "@/contexts/EventCheckoutContext";
import { useContext } from "react";

export const useEventCheckout = () => {
  const ctx = useContext(EventCheckoutContext);
  if (!ctx)
    throw new Error(
      "useEventCheckout must be used within EventCheckoutProvider"
    );
  return ctx;
};
