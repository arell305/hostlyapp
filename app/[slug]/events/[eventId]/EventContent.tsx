"use client";
import { useAction, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import DetailsView from "../../app/components/view/DetailsView";
import About from "../../app/components/view/About";
import {
  EventSchema,
  PromoterPromoCodeWithDiscount,
  TicketInfoSchema,
} from "@/types/schemas-types";
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
import { ResponseStatus } from "@/types/enums";
import { isValidEmail } from "../../../../utils/helpers";
import { Button } from "@/components/ui/button";
import { TicketSoldCounts } from "@/types/types";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import EmptyList from "@/components/shared/EmptyList";
interface EventContentProps {
  isStripeEnabled: boolean;
  connectedAccountStripeId: string | null;
  stripePromise: Promise<Stripe | null>;
  eventData: EventSchema;
  ticketInfoData?: TicketInfoSchema | null;
  onBrowseMoreEvents: () => void;
  ticketSoldCounts?: TicketSoldCounts | null;
}

const EventContent: React.FC<EventContentProps> = ({
  isStripeEnabled,
  connectedAccountStripeId,
  stripePromise,
  eventData,
  ticketInfoData,
  onBrowseMoreEvents,
  ticketSoldCounts,
}) => {
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const [shouldValidate, setShouldValidate] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
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
    if (!email || !isValidEmail(email)) {
      setEmailError(FrontendErrorMessages.EMAIL_REQUIRED);
      return;
    }

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
          email: email.trim(),
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
    ticketInfoData && isStripeEnabled && !paymentSuccess && isTicketsSalesOpen;

  const shouldShowPurchaseForm =
    (maleCount > 0 || femaleCount > 0) && !paymentSuccess && isTicketsSalesOpen;

  const shouldShowStripeForm =
    clientSecret && !paymentSuccess && isTicketsSalesOpen;

  return (
    <SectionContainer className="flex flex-col md:flex-row ">
      <DetailsView eventData={eventData} ticketInfoData={ticketInfoData} />
      <div className="flex flex-col space-y-4">
        <About description={eventData.description} />
        {paymentSuccess && (
          <OrderReceipt onBrowseMoreEvents={onBrowseMoreEvents} />
        )}
        {!isTicketsSalesOpen && <EmptyList message="Ticket sales are closed" />}

        {shouldShowTicketPurchase && (
          <div className="flex flex-col bg-white rounded border border-altGray shadow mx-auto w-[95%]">
            {!shouldShowStripeForm && (
              <div className="py-3 px-7 pb-10">
                <h2 className="text-2xl font-bold mb-2 text-start">Tickets</h2>

                <TicketSelector
                  label="Male"
                  count={maleCount}
                  setCount={setMaleCount}
                  price={discountedMalePrice}
                  soldCount={ticketSoldCounts?.male || 0}
                  capacity={ticketInfoData?.ticketTypes.male.capacity || 0}
                />
                <TicketSelector
                  label="Female"
                  count={femaleCount}
                  setCount={setFemaleCount}
                  price={discountedFemalePrice}
                  soldCount={ticketSoldCounts?.female || 0}
                  capacity={ticketInfoData?.ticketTypes.female.capacity || 0}
                />
              </div>
            )}

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
                {shouldShowStripeForm ? (
                  <div className="py-5 px-7 space-y-4">
                    <Button
                      onClick={() => setClientSecret(null)}
                      variant="navGhost"
                      size="nav"
                    >
                      ← Back to ticket selection
                    </Button>

                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <TicketPaymentForm
                        setPaymentSuccess={setPaymentSuccess}
                      />
                    </Elements>
                  </div>
                ) : (
                  <div className="py-3 px-7">
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
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </SectionContainer>
  );
};

export default EventContent;
