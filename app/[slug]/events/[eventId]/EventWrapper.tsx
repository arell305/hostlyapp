"use client";
import { useAction, useQuery } from "convex/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { ResponseStatus } from "../../../../utils/enum";
import DetailsView from "../../app/components/view/DetailsView";
import About from "../../app/components/view/About";
import _ from "lodash";
import { isValidEmail } from "../../../../utils/helpers";
import {
  CustomerTicket,
  PromoterPromoCodeWithDiscount,
} from "@/types/schemas-types";
import CustomerTicketView from "../../app/components/view/CustomerTickets";
import { Button } from "@/components/ui/button";
import { FrontendErrorMessages } from "@/types/enums";
import { useIsStripeEnabled } from "@/hooks/useIsStripeEnabled";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const EventWrapper = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });
  const slug = params.slug as string;
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

  // const stripe = useStripe();
  // const elements = useElements();

  // promo code
  const [shouldValidate, setShouldValidate] = useState<boolean>(false);
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
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  const createPaymentIntent = useAction(api.stripe.createPaymentIntent);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const {
    isStripeEnabled,
    connectedAccountId,
    isLoading,
    connectedAccountError,
  } = useIsStripeEnabled({
    slug,
  });
  const discountAmount = validationResult ? validationResult.promoDiscount : 0;

  const discountedMalePrice = Math.max(
    (getEventByIdResponse?.data?.ticketInfo?.ticketTypes?.male?.price ?? 0) -
      discountAmount,
    0
  );

  const discountedFemalePrice = Math.max(
    (getEventByIdResponse?.data?.ticketInfo?.ticketTypes?.female?.price ?? 0) -
      discountAmount,
    0
  );
  const totalMalePrice = maleCount * discountedMalePrice;
  const totalFemalePrice = femaleCount * discountedFemalePrice;
  const totalPrice = totalMalePrice + totalFemalePrice;
  const totalDiscount = (maleCount + femaleCount) * discountAmount;

  useEffect(() => {
    if (shouldValidate) {
      setIsApplyPromoCodeLoading(true);
      if (validatePromoterPromoCodeQuery === undefined) {
      } else if (
        validatePromoterPromoCodeQuery.status === ResponseStatus.ERROR
      ) {
        setPromoCodeError(validatePromoterPromoCodeQuery.error);
        setIsApplyPromoCodeLoading(false);
        setShouldValidate(false);
      } else {
        setIsPromoApplied(true);
        setPromoterId(
          validatePromoterPromoCodeQuery.data.promoterPromoCode.promoterUserId
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
      setPromoCodeError(FrontendErrorMessages.PROMO_CODE_REQUIRED);
      return;
    }

    setShouldValidate(true);
  };

  const handlePurchase = async () => {
    // if (!stripe || !elements || !connectedAccountId) {
    //   setPurchaseError(FrontendErrorMessages.STRIPE_NOT_INITALIZED);
    //   return;
    // }
    // if (!isValidEmail(email)) {
    //   setEmailError(FrontendErrorMessages.EMAIL_REQUIRED);
    //   return;
    // }
    // setIsPurchaseLoading(true);
    // setPurchaseError(null);
    // if (!getEventByIdResponse?.data) {
    //   setPurchaseError("Error purchasing ticket. Please try again.");
    //   setIsPurchaseLoading(false);
    //   return;
    // }
    // try {
    //   const cardElement = elements.getElement(CardElement);
    //   if (!cardElement) {
    //     setPurchaseError(FrontendErrorMessages.PAYMENT_METHOD_UNAVAILABLE);
    //     setIsPurchaseLoading(false);
    //     return;
    //   }
    //   const response = await createPaymentIntent({
    //     stripeAccountId: connectedAccountId,
    //     totalAmount: totalPrice,
    //     metadata: {
    //       eventId: getEventByIdResponse?.data?.event._id,
    //       promoCode,
    //       email,
    //       maleCount,
    //       femaleCount,
    //     },
    //   });
    //   if (response.status === ResponseStatus.ERROR) {
    //     setPurchaseError(response.error);
    //     setIsPurchaseLoading(false);
    //     return;
    //   }
    //   const clientSecret = response.data.clientSecret;
    //   const { paymentIntent, error } = await stripe.confirmCardPayment(
    //     clientSecret,
    //     {
    //       payment_method: { card: cardElement },
    //     }
    //   );
    //   if (error) {
    //     setPurchaseError(error.message || "Payment failed.");
    //   } else if (paymentIntent.status === "succeeded") {
    //     console.log("purchase success");
    //   }
    // } catch (error) {
    //   console.error(FrontendErrorMessages.ERROR_PURCHASING_TICKET, error);
    //   setPurchaseError(FrontendErrorMessages.ERROR_PURCHASING_TICKET);
    // } finally {
    //   setIsPurchaseLoading(false);
    // }
  };

  const handleCheckout = async () => {
    if (!connectedAccountId) {
      setCheckoutError("Error loading stripe");
      return;
    }
    setIsCheckoutLoading(false);
    setCheckoutError(null);
    try {
      const response = await createPaymentIntent({
        stripeAccountId: connectedAccountId,
        totalAmount: totalPrice,
        metadata: {
          eventId: getEventByIdResponse?.data?.event._id as string,
          promoCode,
          email: "tes@gmail.com",
          maleCount,
          femaleCount,
        },
      });
      if (response.status === ResponseStatus.ERROR) {
        setCheckoutError(response.error);
      } else {
        console.log("secret", response.data.clientSecret);
        setClientSecret(response.data.clientSecret);
      }
    } catch (error) {
      console.error(FrontendErrorMessages.CHECKOUT_FAILED, error);
      setCheckoutError(FrontendErrorMessages.CHECKOUT_FAILED);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleBrowseMoreEvents = () => {
    const slug = pathname.split("/")[1];
    const newUrl = `/${slug}`;
    router.push(newUrl);
  };

  if (!getEventByIdResponse || isLoading) {
    return <FullLoading />;
  }

  if (
    getEventByIdResponse.status === ResponseStatus.ERROR ||
    connectedAccountError
  ) {
    return <ErrorComponent message={FrontendErrorMessages.GENERIC_ERROR} />;
  }

  return (
    <div className="bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="navGhost"
          className="pt-4"
          onClick={handleBrowseMoreEvents}
        >
          Back to Events
        </Button>
        <div className=" flex flex-col justify-center items-center space-y-4  pb-4 pt-4 min-h-[100vh]">
          <DetailsView eventData={getEventByIdResponse.data.event} />
          <About description={getEventByIdResponse.data.event.description} />
          {getEventByIdResponse.data.ticketInfo && isStripeEnabled && (
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
              onCheckout={handleCheckout}
              checkoutError={checkoutError}
              isCheckoutLoading={isCheckoutLoading}
              clientSecret={clientSecret}
              stripeAccountId={connectedAccountId}
              totalMalePrice={totalMalePrice}
              totalFemalePrice={totalFemalePrice}
              totalDiscount={totalDiscount}
              discountAmount={discountAmount}
              totalPrice={totalPrice}
              discountedMalePrice={discountedMalePrice}
              discountedFemalePrice={discountedFemalePrice}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventWrapper;
