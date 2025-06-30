"use client";

import React from "react";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import { formatCurrency } from "@/utils/helpers";

const OrderSummary: React.FC = () => {
  const { pricing, validationResult } = useEventCheckout();

  return (
    <div className="space-y-2 py-3 px-7">
      <h2 className="text-2xl font-bold">Order Summary</h2>

      {pricing.perTicketPrices
        .filter((ticket) => ticket.quantity > 0)
        .map((ticket) => (
          <p key={ticket.ticketTypeId}>
            {ticket.quantity} x {formatCurrency(ticket.discountedPrice)} ={" "}
            {formatCurrency(ticket.subtotal)}
          </p>
        ))}

      {validationResult && (
        <p className="text-green-600">
          Discount Applied: -{formatCurrency(pricing.totalDiscount)} (
          {formatCurrency(pricing.discountAmount)} per ticket)
        </p>
      )}

      <p className="font-semibold">
        Total: {formatCurrency(pricing.totalPrice)}
      </p>
    </div>
  );
};

export default OrderSummary;
