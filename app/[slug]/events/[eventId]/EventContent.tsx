"use client";
import { useAction, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { ResponseStatus } from "../../../../utils/enum";
import DetailsView from "../../app/components/view/DetailsView";
import About from "../../app/components/view/About";
import _ from "lodash";
import {
  EventSchema,
  PromoterPromoCodeWithDiscount,
  TicketInfoSchema,
} from "@/types/schemas-types";
import { Button } from "@/components/ui/button";
import { FrontendErrorMessages } from "@/types/enums";
import OrderReceipt from "@/[slug]/app/components/view/OrderReceipt";
import { Elements } from "@stripe/react-stripe-js";
import TicketPaymentForm from "@/[slug]/app/components/TicketPaymentForm";
import { Stripe } from "@stripe/stripe-js";
import TicketSelector from "@/[slug]/app/components/view/TicketSelector";
import OrderSummary from "@/[slug]/app/components/view/OrderSummary";
import EmailInput from "@/[slug]/app/components/view/EmailInput";
import PromoCodeInput from "@/[slug]/app/components/view/PromoCodeInput";
import CheckoutButton from "@/[slug]/app/components/view/CheckoutButton";
import {
  calculateTicketPricing,
  isTicketSalesOpen,
} from "@/lib/frontendHelper";
import MessageCard from "@/[slug]/app/components/ui/MessageCard";

interface EventContentProps {
  isStripeEnabled: boolean;
  connectedAccountStripeId: string | null;
  stripePromise: Promise<Stripe | null>;
  eventData: EventSchema;
  ticketInfoData?: TicketInfoSchema | null;
  onBrowseMoreEvents: () => void;
}

const EventContent: React.FC<EventContentProps> = ({
  isStripeEnabled,
  connectedAccountStripeId,
  stripePromise,
  eventData,
  ticketInfoData,
  onBrowseMoreEvents,
}) => {
  // ticket purchase
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);

  // promo code
  const [shouldValidate, setShouldValidate] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoCodeError, setPromoCodeError] = useState<string>("");
  const [validationResult, setValidationResult] =
    useState<PromoterPromoCodeWithDiscount | null>(null);
  const [isApplyPromoCodeLoading, setIsApplyPromoCodeLoading] =
    useState<boolean>(false);
  const [isPromoApplied, setIsPromoApplied] = useState<boolean>(false);

  const [isCheckoutLoading, setIsCheckoutLoading] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const validatePromoterPromoCodeQuery = useQuery(
    api.promoterPromoCode.validatePromoterPromoCode,
    shouldValidate ? { name: promoCode, eventId: eventData._id } : "skip"
  );
  const createPaymentIntent = useAction(api.stripe.createPaymentIntent);

  // isTicketsSalesOpen is null if there is not ticket info
  const isTicketsSalesOpen = isTicketSalesOpen(ticketInfoData);

  const {
    discountAmount,
    discountedMalePrice,
    discountedFemalePrice,
    totalMalePrice,
    totalFemalePrice,
    totalPrice,
    totalDiscount,
  } = calculateTicketPricing(
    ticketInfoData,
    maleCount,
    femaleCount,
    validationResult
  );

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

  const handleCheckout = async () => {
    if (!connectedAccountStripeId) {
      console.error("connectedAccountStripeId not found");
      setCheckoutError(FrontendErrorMessages.GENERIC_ERROR);
      return;
    }
    setIsCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const response = await createPaymentIntent({
        stripeAccountId: connectedAccountStripeId,
        totalAmount: totalPrice,
        metadata: {
          eventId: eventData._id as string,
          promoCode,
          email,
          maleCount,
          femaleCount,
        },
      });
      if (response.status === ResponseStatus.ERROR) {
        setCheckoutError(response.error);
      } else {
        setClientSecret(response.data.clientSecret);
      }
    } catch (error) {
      console.error(FrontendErrorMessages.CHECKOUT_FAILED, error);
      setCheckoutError(FrontendErrorMessages.CHECKOUT_FAILED);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const shouldShowTicketPurchase =
    ticketInfoData &&
    isStripeEnabled &&
    !paymentSuccess &&
    !clientSecret &&
    isTicketsSalesOpen;

  const shouldShowPurchaseForm =
    (maleCount > 0 || femaleCount > 0) && !paymentSuccess && isTicketsSalesOpen;
  const shouldShowStripeForm =
    clientSecret && !paymentSuccess && isTicketsSalesOpen;

  return (
    <div className="bg-gray-100">
      <div className="max-w-4xl flex flex-col">
        <Button
          variant="navGhost"
          className="pt-4 justify-start"
          onClick={onBrowseMoreEvents}
        >
          Back to Events
        </Button>
        <div className=" flex flex-col items-center space-y-4  pb-4 pt-4 min-h-[100vh]">
          <DetailsView eventData={eventData} ticketInfoData={ticketInfoData} />
          <About description={eventData.description} />
          {paymentSuccess && (
            <OrderReceipt onBrowseMoreEvents={onBrowseMoreEvents} />
          )}
          {isTicketsSalesOpen === false && (
            <MessageCard message="Ticket sales are closed" />
          )}
          {shouldShowTicketPurchase && (
            <div className="flex flex-col bg-white rounded border border-altGray w-[400px] p-3 shadow">
              <h2 className="text-2xl font-bold mb-2 text-center md:text-start">
                Tickets
              </h2>
              <TicketSelector
                label="Male"
                count={maleCount}
                setCount={setMaleCount}
                price={discountedMalePrice}
              />
              <TicketSelector
                label="Female"
                count={femaleCount}
                setCount={setFemaleCount}
                price={discountedFemalePrice}
              />
              {shouldShowPurchaseForm && (
                <>
                  <OrderSummary
                    maleCount={maleCount}
                    femaleCount={femaleCount}
                    totalMalePrice={totalMalePrice}
                    totalFemalePrice={totalFemalePrice}
                    totalDiscount={totalDiscount}
                    discountAmount={discountAmount}
                    totalPrice={totalPrice}
                    validationResult={validationResult}
                  />
                  <EmailInput
                    email={email}
                    setEmail={setEmail}
                    emailError={emailError}
                    setEmailError={setEmailError}
                  />
                  <PromoCodeInput
                    setPromoCode={setPromoCode}
                    setPromoCodeError={setPromoCodeError}
                    promoCodeError={promoCodeError}
                    onApplyPromo={handleApplyPromoCode}
                    isApplyPromoCodeLoading={isApplyPromoCodeLoading}
                    promoCode={promoCode}
                    isPromoApplied={isPromoApplied}
                  />
                  <CheckoutButton
                    onCheckout={handleCheckout}
                    checkoutError={checkoutError}
                    isCheckoutLoading={isCheckoutLoading}
                  />
                </>
              )}
              {shouldShowStripeForm && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <TicketPaymentForm setPaymentSuccess={setPaymentSuccess} />
                </Elements>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventContent;
