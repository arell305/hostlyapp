"use client";

import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import { formatCurrency } from "@/shared/utils/helpers";

const OrderSummary: React.FC = () => {
  const { pricing, validationResult } = useEventCheckout();

  return (
    <div className="space-y-2 py-3 px-4">
      <h2 className="text-2xl font-bold">Order Summary</h2>

      {pricing.perTicketPrices
        .filter((ticket) => ticket.quantity > 0)
        .map((ticket) => (
          <div key={ticket.ticketTypeId} className="flex justify-between">
            <span>
              {ticket.ticketType.name}{" "}
              <span className="text-grayText">
                ({ticket.quantity} @ {formatCurrency(ticket.discountedPrice)})
              </span>
            </span>
            <span>{formatCurrency(ticket.subtotal)}</span>
          </div>
        ))}

      {validationResult && (
        <p className="text-green-600">
          Discount Applied: -{formatCurrency(pricing.totalDiscount)} (
          {formatCurrency(pricing.discountAmount)} per ticket)
        </p>
      )}

      <div className="flex justify-between font-semibold pt-2   mt-2">
        <span>Total</span>
        <span>{formatCurrency(pricing.totalPrice)}</span>
      </div>
    </div>
  );
};

export default OrderSummary;
