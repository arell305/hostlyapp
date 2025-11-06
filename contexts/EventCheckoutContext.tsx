"use client";

import { createContext, useState, useMemo } from "react";
import { PromoterPromoCodeWithDiscount } from "@shared/types/schemas-types";
import { calculateTicketPricing } from "@shared/lib/frontendHelper";
import { Doc } from "convex/_generated/dataModel";

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

  termsAccepted: boolean;
  setTermsAccepted: (val: boolean) => void;
}

export const EventCheckoutContext = createContext<
  EventCheckoutContextValue | undefined
>(undefined);

export const EventCheckoutProvider = ({
  children,
  ticketTypes,
}: {
  children: React.ReactNode;
  ticketTypes: Doc<"eventTicketTypes">[];
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
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

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
        termsAccepted,
        setTermsAccepted,
      }}
    >
      {children}
    </EventCheckoutContext.Provider>
  );
};
