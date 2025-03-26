import React from "react";
import { formatCurrency } from "../../../../../utils/helpers";
import { PromoterPromoCodeWithDiscount } from "@/types/schemas-types";

interface OrderSummaryProps {
  maleCount: number;
  femaleCount: number;
  totalMalePrice: number;
  totalFemalePrice: number;
  totalDiscount: number;
  discountAmount: number;
  totalPrice: number;
  validationResult: PromoterPromoCodeWithDiscount | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  maleCount,
  femaleCount,
  totalMalePrice,
  totalFemalePrice,
  totalDiscount,
  discountAmount,
  totalPrice,
  validationResult,
}) => {
  return (
    <div className="space-y-2 py-3 px-7">
      <h2 className="text-2xl font-bold">Order Summary</h2>
      {maleCount > 0 && (
        <p>
          Male Tickets: {maleCount} x {formatCurrency(totalMalePrice)}
        </p>
      )}
      {femaleCount > 0 && (
        <p>
          Female Tickets: {femaleCount} x {formatCurrency(totalFemalePrice)}
        </p>
      )}
      {validationResult && (
        <p className="text-green-600">
          Discount Applied: -{formatCurrency(totalDiscount)} (${discountAmount}{" "}
          per ticket)
        </p>
      )}
      <p className="font-semibold">Total: {formatCurrency(totalPrice)}</p>
    </div>
  );
};

export default OrderSummary;
