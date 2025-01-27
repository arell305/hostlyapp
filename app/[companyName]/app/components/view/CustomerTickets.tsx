import { TicketInfo } from "@/types/types";
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
  TicketSchema,
} from "@/types/schemas-types";
import CustomerTicketCard from "../cards/CustomerTicketCard";

interface OrderReceiptProps {
  maleCount: number;
  femaleCount: number;
  totalPrice: number;
  totalDiscount: number;
  discountedMalePrice: number;
  discountedFemalePrice: number;
  onBrowseMoreEvents: () => void;
  purchasedTickets: CustomerTicket[];
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({
  maleCount,
  femaleCount,
  totalPrice,
  totalDiscount,
  discountedMalePrice,
  discountedFemalePrice,
  onBrowseMoreEvents,
  purchasedTickets,
}) => (
  <div className="flex flex-col bg-white rounded border border-altGray w-[400px] p-3 shadow">
    <h2 className="text-2xl font-bold mb-2 text-center">Order Receipt</h2>
    <div className="mt-4 space-y-2 border-b pb-2">
      <h3 className="font-semibold">Order Summary</h3>
      {maleCount > 0 && (
        <p>
          Male Tickets: {maleCount} x {formatCurrency(discountedMalePrice)}
        </p>
      )}
      {femaleCount > 0 && (
        <p>
          Female Tickets: {femaleCount} x{" "}
          {formatCurrency(discountedFemalePrice)}
        </p>
      )}
      {totalDiscount > 0 && (
        <p className="text-green-600">
          Discount Applied: -{formatCurrency(totalDiscount)}
        </p>
      )}
      <p className="font-semibold">Total Paid: {formatCurrency(totalPrice)}</p>
    </div>
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Your Tickets</h3>
      <div className="space-y-4">
        {purchasedTickets.map((ticket: CustomerTicket) => (
          <CustomerTicketCard key={ticket.ticketUniqueId} ticket={ticket} />
        ))}
      </div>
    </div>
    <div className="mt-4">
      <p className="text-sm text-center">
        You will also recieve an email with your tickets. Thank you for your
        purchase!
      </p>
    </div>
    <div className="mt-4">
      <Button className="w-full" onClick={onBrowseMoreEvents}>
        Browse More Events
      </Button>
    </div>
  </div>
);

interface CustomerTicketViewProps {
  ticketData: TicketInfo;
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
}) => {
  const discountAmount = validationResult ? validationResult.promoDiscount : 0;
  const discountedMalePrice = Math.max(
    ticketData.maleTicketPrice - discountAmount,
    0
  );
  const discountedFemalePrice = Math.max(
    ticketData.femaleTicketPrice - discountAmount,
    0
  );
  const totalMalePrice = maleCount * discountedMalePrice;
  const totalFemalePrice = femaleCount * discountedFemalePrice;
  const totalPrice = totalMalePrice + totalFemalePrice;
  const totalDiscount = (maleCount + femaleCount) * discountAmount;

  const isTicketsSalesOpen = isAfterNowInPacificTime(
    ticketData.ticketSalesEndTime
  );
  console.log("pur", purchasedTickets);
  if (purchasedTickets) {
    return (
      <OrderReceipt
        maleCount={maleCount}
        femaleCount={femaleCount}
        totalPrice={totalPrice}
        totalDiscount={totalDiscount}
        discountedMalePrice={discountedMalePrice}
        discountedFemalePrice={discountedFemalePrice}
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
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              error={emailError}
            />
            <p
              className={`pl-4 text-sm mt-1 ${emailError ? "text-red-500" : "text-transparent"}`}
            >
              {emailError || "Placeholder to maintain height"}
            </p>
          </div>

          <div className="mt-4">
            <Button
              className="w-full"
              onClick={onPurchase}
              disabled={isPurchaseLoading || !email}
            >
              {isPurchaseLoading ? "Processing..." : "Purchase Tickets"}
            </Button>
          </div>

          {purchaseError && (
            <p className="text-red-500 text-center mt-2">{purchaseError}</p>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerTicketView;
