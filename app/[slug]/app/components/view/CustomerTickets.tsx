import React from "react";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import {
  formatCurrency,
  isAfterNowInPacificTime,
} from "../../../../../utils/helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CustomerTicket,
  PromoterPromoCodeWithDiscount,
  TicketInfoSchema,
} from "@/types/schemas-types";
import CustomerTicketCard from "../cards/CustomerTicketCard";
import { Elements } from "@stripe/react-stripe-js";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import TicketPaymentForm from "../TicketPaymentForm";

interface OrderReceiptProps {
  onBrowseMoreEvents: () => void;
  purchasedTickets: CustomerTicket[];
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({
  onBrowseMoreEvents,
  purchasedTickets,
}) => (
  <div className="flex flex-col bg-white rounded border border-altGray w-[400px] shadow mb-4">
    <div className="mt-4">
      <h2 className="mb-2 px-3  text-2xl font-bold text-center">
        Your Tickets
      </h2>
      <div className="mt-1 mb-4">
        <p className="text-sm px-3">
          You will also recieve an email with your tickets. Thank you for your
          purchase!
        </p>
      </div>
      <div className="space-y-4 mx-3">
        {purchasedTickets.map((ticket: CustomerTicket) => (
          <CustomerTicketCard key={ticket.ticketUniqueId} ticket={ticket} />
        ))}
      </div>
    </div>

    <div className="mt-4 p-3 mb-4">
      <Button className="w-full" onClick={onBrowseMoreEvents}>
        Browse More Events
      </Button>
    </div>
  </div>
);

interface CustomerTicketViewProps {
  ticketData: TicketInfoSchema;
  maleCount: number;
  femaleCount: number;
  setMaleCount: (arg0: number) => void;
  setFemaleCount: (arg0: number) => void;
  isPurchaseLoading: boolean;
  purchaseError: string | null;
  onPurchase: () => void;
  setEmail: (arg0: string) => void;
  email: string;
  setEmailError: (arg0: string) => void;
  emailError: string;
  promoCode: string;
  setPromoCode: (arg0: string) => void;
  setPromoCodeError: (arg0: string) => void;
  promoCodeError: string;
  onApplyPromo: () => void;
  isApplyPromoCodeLoading: boolean;
  isPromoApplied: boolean;
  validationResult: PromoterPromoCodeWithDiscount | null;
  purchasedTickets: CustomerTicket[] | null;
  onBrowseMoreEvents: () => void;
  onCheckout: () => void;
  checkoutError: string | null;
  isCheckoutLoading: boolean;
  clientSecret: string | null;
  stripeAccountId?: string | null;
}

const CustomerTicketView: React.FC<CustomerTicketViewProps> = ({
  ticketData,
  maleCount,
  femaleCount,
  setMaleCount,
  setFemaleCount,
  isPurchaseLoading,
  purchaseError,
  setEmail,
  onPurchase,
  setEmailError,
  email,
  emailError,
  promoCode,
  setPromoCode,
  setPromoCodeError,
  promoCodeError,
  onApplyPromo,
  isApplyPromoCodeLoading,
  isPromoApplied,
  validationResult,
  purchasedTickets,
  onBrowseMoreEvents,
  onCheckout,
  checkoutError,
  isCheckoutLoading,
  clientSecret,
  stripeAccountId,
}) => {
  const discountAmount = validationResult ? validationResult.promoDiscount : 0;
  const discountedMalePrice = Math.max(
    ticketData.ticketTypes.male.price - discountAmount,
    0
  );
  const discountedFemalePrice = Math.max(
    ticketData.ticketTypes.female.price - discountAmount,
    0
  );
  const totalMalePrice = maleCount * discountedMalePrice;
  const totalFemalePrice = femaleCount * discountedFemalePrice;
  const totalPrice = totalMalePrice + totalFemalePrice;
  const totalDiscount = (maleCount + femaleCount) * discountAmount;

  const isTicketsSalesOpen = isAfterNowInPacificTime(
    ticketData.ticketSalesEndTime
  );

  let stripePromise: Promise<Stripe | null> = Promise.resolve(null);

  if (stripeAccountId) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
      {
        stripeAccount: stripeAccountId,
      }
    );
  }

  if (purchasedTickets) {
    return (
      <OrderReceipt
        onBrowseMoreEvents={onBrowseMoreEvents}
        purchasedTickets={purchasedTickets}
      />
    );
  }
  return (
    <div className="flex flex-col bg-white rounded border border-altGray w-[400px] p-3 shadow">
      <h2 className="text-2xl font-bold mb-2 text-center md:text-start">
        Tickets
      </h2>
      {isTicketsSalesOpen ? (
        <>
          <div className="flex justify-between border-b border-altGray py-2">
            <div>
              <h3 className="font-semibold font-raleway">Male Tickets</h3>
              <p className="text-sm text-altBlack">
                {formatCurrency(discountedMalePrice)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CiCircleMinus
                className="text-3xl hover:cursor-pointer"
                onClick={() => setMaleCount(Math.max(0, maleCount - 1))}
              />
              <p className="text-xl w-8 text-center">{maleCount}</p>
              <CiCirclePlus
                className="text-3xl hover:cursor-pointer"
                onClick={() => setMaleCount(maleCount + 1)}
              />
            </div>
          </div>
          <div className="flex justify-between border-b border-altGray py-2">
            <div>
              <h3 className="font-semibold font-raleway">Female Tickets</h3>
              <p className="text-sm text-altBlack">
                {formatCurrency(discountedFemalePrice)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CiCircleMinus
                className="text-3xl hover:cursor-pointer"
                onClick={() => setFemaleCount(Math.max(0, femaleCount - 1))}
              />
              <p className="text-xl w-8 text-center">{femaleCount}</p>
              <CiCirclePlus
                className="text-3xl hover:cursor-pointer"
                onClick={() => setFemaleCount(femaleCount + 1)}
              />
            </div>
          </div>
        </>
      ) : (
        <p>Ticket sales are closed.</p>
      )}
      {(maleCount > 0 || femaleCount > 0) && (
        <>
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">Order Summary</h3>
            {maleCount > 0 && (
              <p>
                Male Tickets: {maleCount} x {formatCurrency(totalMalePrice)}
              </p>
            )}
            {femaleCount > 0 && (
              <p>
                Female Tickets: {femaleCount} x{" "}
                {formatCurrency(totalFemalePrice)}
              </p>
            )}
            {validationResult && (
              <p className="text-green-600">
                Discount Applied: -{formatCurrency(totalDiscount)} ($
                {discountAmount} per ticket)
              </p>
            )}
            <p className="font-semibold">Total: {formatCurrency(totalPrice)}</p>
          </div>
          <div className="mt-4">
            <Label>Promo Code</Label>
            <div className="flex">
              <Input
                type="promo code"
                placeholder="Enter any promo code"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoCodeError("");
                }}
                error={promoCodeError}
                readOnly={isPromoApplied}
              />
              <Button
                disabled={isApplyPromoCodeLoading || isPromoApplied}
                variant="secondary"
                className={`rounded-lg ml-6 ${isPromoApplied ? "border-b border-customDarkBlue" : ""}`}
                onClick={onApplyPromo}
              >
                {isPromoApplied
                  ? "Applied ✓"
                  : isApplyPromoCodeLoading
                    ? "Applying..."
                    : "Apply"}
              </Button>
            </div>
            <p
              className={`text-sm mt-1 ${promoCodeError ? "text-red-500" : "text-transparent"}`}
            >
              {promoCodeError || "Placeholder to maintain height"}
            </p>
          </div>
          <div className="mt-4">
            <Button
              className="w-full"
              onClick={onCheckout}
              disabled={isCheckoutLoading}
            >
              {isCheckoutLoading ? "Checking Out..." : "Checkout"}
            </Button>
            <p
              className={`pl-4 text-sm mt-1 ${checkoutError ? "text-red-500" : "text-transparent"}`}
            >
              {checkoutError || "Placeholder to maintain height"}
            </p>
          </div>
          {clientSecret && stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <TicketPaymentForm />
            </Elements>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerTicketView;
