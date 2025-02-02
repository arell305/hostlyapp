"use client";
import { useAction, useMutation, useQuery } from "convex/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import EventInfoSkeleton from "../app/components/loading/EventInfoSkeleton";
import { ResponseStatus } from "../../../utils/enum";
import NotFound from "../app/components/errors/NotFound";
import DetailsView from "../app/components/view/DetailsView";
import About from "../app/components/view/About";
import TicketView from "../app/components/view/Tickets";
import QRCode from "qrcode";
import _ from "lodash";
import { isValidEmail } from "../../../utils/helpers";
import {
  CustomerTicket,
  PromoterPromoCodeWithDiscount,
  TicketSchema,
} from "@/types/schemas-types";
import CustomerTicketView from "../app/components/view/CustomerTickets";

const page = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  // ticket purchase
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [isPurchaseLoading, setIsPurchaseLoading] = useState<boolean>(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>("");
  const [purchasedTickets, setPurchasedTickets] = useState<
    CustomerTicket[] | null
  >(null);
  const insertTicketsSold = useAction(api.tickets.insertTicketsSold);

  // promo code
  const [shouldValidate, setShouldValidate] = useState(false);
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoCodeError, setPromoCodeError] = useState<string>("");
  const [validationResult, setValidationResult] =
    useState<PromoterPromoCodeWithDiscount | null>(null);
  const [isApplyPromoCodeLoading, setIsApplyPromoCodeLoading] =
    useState<boolean>(false);
  const [isPromoApplied, setIsPromoApplied] = useState<boolean>(false);
  const validatePromoterPromoCodeQuery = useQuery(
    api.promoterPromoCode.validatePromoterPromoCode,
    shouldValidate ? { name: promoCode, eventId } : "skip"
  );
  const [promoterId, setPromoterId] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (shouldValidate) {
      if (validatePromoterPromoCodeQuery === undefined) {
        // Query is still loading
      } else if (
        validatePromoterPromoCodeQuery.status === ResponseStatus.ERROR
      ) {
        setPromoCodeError(validatePromoterPromoCodeQuery.error);
        setIsApplyPromoCodeLoading(false);
        setShouldValidate(false);
      } else {
        // successful
        setIsPromoApplied(true);
        setPromoterId(
          validatePromoterPromoCodeQuery.data.promoterPromoCode
            .clerkPromoterUserId
        );
        setValidationResult(
          validatePromoterPromoCodeQuery.data.promoterPromoCode
        );
        setIsApplyPromoCodeLoading(false);
        setShouldValidate(false);
      }
    }
  }, [shouldValidate, validatePromoterPromoCodeQuery]);

  const handleApplyPromoCode = () => {
    if (!promoCode) {
      setPromoCodeError("Please enter a promo code");
      return;
    }
    setIsApplyPromoCodeLoading(true);
    setShouldValidate(true);
  };

  const [qrCode, setQrCode] = useState("");

  // const generateQR = async () => {
  //   try {
  //     const eventData = JSON.stringify({ info: eventId });
  //     const url = await QRCode.toDataURL(eventData);
  //     setQrCode(url);
  //   } catch (error) {
  //     console.error("Error generating QR code:", error);
  //   }
  // };

  const handlePurchase = async () => {
    if (!isValidEmail(email)) {
      setEmailError("Valid email required");
      return;
    }
    setIsPurchaseLoading(true);
    setPurchaseError(null);
    if (!getEventByIdResponse?.data) {
      setPurchaseError("Error purchasing ticket. Please try again.");
      return;
    }
    try {
      const result = await insertTicketsSold({
        eventId: getEventByIdResponse?.data?.event._id,
        promoterPromoCodeId: validationResult?._id || null,
        email,
        maleCount,
        femaleCount,
      });
      if (result.status === ResponseStatus.SUCCESS) {
        setPurchasedTickets(result.data.tickets);
      } else {
        console.error("error purchasing ticket", result.error);
        setPurchaseError("Error purchasing ticket");
      }
    } catch (error) {
      console.error("error purchasing ticket", error);
      setPurchaseError("Error purchasing ticket");
    }
    setIsPurchaseLoading(false);
  };

  const handleBrowseMoreEvents = () => {
    // Logic for navigating to more events
    const companyName = pathname.split("/")[1];
    const newUrl = `/${companyName}`;
    router.push(newUrl);
  };

  if (getEventByIdResponse === undefined) {
    return <EventInfoSkeleton />;
  }

  if (getEventByIdResponse.status === ResponseStatus.ERROR) {
    return <NotFound text={"event"} />; // Or handle it in another way
  }

  return (
    <div className="flex flex-col justify-center items-center space-y-4 bg-gray-100 pb-4 pt-4 min-h-[100vh]">
      <DetailsView eventData={getEventByIdResponse.data.event} />
      <About description={getEventByIdResponse.data.event.description} />
      {getEventByIdResponse.data.ticketInfo && (
        <CustomerTicketView
          ticketData={getEventByIdResponse.data.ticketInfo}
          maleCount={maleCount}
          femaleCount={femaleCount}
          setMaleCount={setMaleCount}
          setFemaleCount={setFemaleCount}
          isPurchaseLoading={isPurchaseLoading}
          purchaseError={purchaseError}
          onPurchase={handlePurchase}
          setEmail={setEmail}
          email={email}
          setEmailError={setEmailError}
          emailError={emailError}
          setPromoCode={setPromoCode}
          setPromoCodeError={setPromoCodeError}
          promoCodeError={promoCodeError}
          onApplyPromo={handleApplyPromoCode}
          isApplyPromoCodeLoading={isApplyPromoCodeLoading}
          promoCode={promoCode}
          isPromoApplied={isPromoApplied}
          validationResult={validationResult}
          onBrowseMoreEvents={handleBrowseMoreEvents}
          purchasedTickets={purchasedTickets}
        />
      )}
    </div>
  );
};

export default page;
