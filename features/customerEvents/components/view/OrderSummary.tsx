"use client";

import React from "react";
import { useEventCheckout } from "@/shared/hooks/contexts";
import { formatCurrency } from "@shared/utils/helpers";
import { TICKET_SALES_COPY } from "@/app/types/constants";

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
        <div className="flex flex-col">
          <span>Total</span>
          <p className="text-grayText font-normal">{TICKET_SALES_COPY}</p>
        </div>
        <span>{formatCurrency(pricing.totalPrice)}</span>
      </div>
    </div>
  );
};

export default OrderSummary;
