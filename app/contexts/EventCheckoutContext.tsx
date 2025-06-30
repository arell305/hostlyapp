"use client";

import { createContext, useContext, useState, useMemo } from "react";
import { PromoterPromoCodeWithDiscount } from "@/types/schemas-types";
import { calculateTicketPricing } from "@/lib/frontendHelper";
import { EventTicketTypesSchema } from "@/types/schemas-types";
import { TicketSoldCountByType } from "@/types/types";

interface EventCheckoutContextValue {
  ticketCounts: Record<string, number>;
  setCountForTicket: (id: string, val: number) => void;

  email: string;
  setEmail: (email: string) => void;
  emailError: string | null;
  setEmailError: (err: string | null) => void;

  promoCode: string;
  setPromoCode: (code: string) => void;
  promoCodeError: string | null;
  setPromoCodeError: (err: string | null) => void;
  isPromoApplied: boolean;
  setIsPromoApplied: (val: boolean) => void;
  validationResult: PromoterPromoCodeWithDiscount | null;
  setValidationResult: (val: PromoterPromoCodeWithDiscount | null) => void;

  clientSecret: string | null;
  setClientSecret: (val: string | null) => void;

  paymentSuccess: boolean;
  setPaymentSuccess: (val: boolean) => void;

  pricing: ReturnType<typeof calculateTicketPricing>;
}

const EventCheckoutContext = createContext<
  EventCheckoutContextValue | undefined
>(undefined);

export const useEventCheckout = () => {
  const ctx = useContext(EventCheckoutContext);
  if (!ctx)
    throw new Error(
      "useEventCheckout must be used within EventCheckoutProvider"
    );
  return ctx;
};

export const EventCheckoutProvider = ({
  children,
  ticketTypes,
  ticketSoldCounts,
}: {
  children: React.ReactNode;
  ticketTypes: EventTicketTypesSchema[];
  ticketSoldCounts?: TicketSoldCountByType[] | null;
}) => {
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [isPromoApplied, setIsPromoApplied] = useState<boolean>(false);
  const [validationResult, setValidationResult] =
    useState<PromoterPromoCodeWithDiscount | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const setCountForTicket = (id: string, val: number) =>
    setTicketCounts((prev) => ({ ...prev, [id]: val }));

  const pricing = useMemo(
    () => calculateTicketPricing(ticketTypes, ticketCounts, validationResult),
    [ticketTypes, ticketCounts, validationResult]
  );

  return (
    <EventCheckoutContext.Provider
      value={{
        ticketCounts,
        setCountForTicket,
        email,
        setEmail,
        emailError,
        setEmailError,
        promoCode,
        setPromoCode,
        promoCodeError,
        setPromoCodeError,
        isPromoApplied,
        setIsPromoApplied,
        validationResult,
        setValidationResult,
        clientSecret,
        setClientSecret,
        paymentSuccess,
        setPaymentSuccess,
        pricing,
      }}
    >
      {children}
    </EventCheckoutContext.Provider>
  );
};
