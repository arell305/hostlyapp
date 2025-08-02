import {
  EventTicketTypesSchema,
  PromoterPromoCodeWithDiscount,
} from "@/types/schemas-types";
import { isAfterNowInPacificTime } from "../../utils/luxon";

interface TicketPricing {
  totalPrice: number;
  totalDiscount: number;
  discountAmount: number;
  perTicketPrices: {
    ticketTypeId: string;
    ticketType: EventTicketTypesSchema;
    quantity: number;
    originalPrice: number;
    discountedPrice: number;
    subtotal: number;
  }[];
}

export const calculateTicketPricing = (
  ticketTypes: EventTicketTypesSchema[],
  ticketCounts: Record<string, number>,
  validationResult: PromoterPromoCodeWithDiscount | null
): TicketPricing => {
  const discountAmount = validationResult?.promoDiscount || 0;

  let totalPrice = 0;
  let totalDiscount = 0;

  const perTicketPrices = ticketTypes.map((ticketType) => {
    const quantity = ticketCounts[ticketType._id] || 0;
    const originalPrice = ticketType.price;
    const discountedPrice = Math.max(originalPrice - discountAmount, 0);
    const subtotal = quantity * discountedPrice;
    const discount = quantity * discountAmount;

    totalPrice += subtotal;
    totalDiscount += discount;

    return {
      ticketTypeId: ticketType._id,
      quantity,
      originalPrice,
      discountedPrice,
      subtotal,
      ticketType,
    };
  });

  return {
    totalPrice,
    totalDiscount,
    discountAmount,
    perTicketPrices,
  };
};

export const isTicketSalesOpen = (
  ticketTypes: EventTicketTypesSchema[] | null | undefined
): boolean | null => {
  if (!ticketTypes || ticketTypes.length === 0) {
    return null;
  }

  return ticketTypes.some((ticket) =>
    isAfterNowInPacificTime(ticket.ticketSalesEndTime)
  );
};

export function isValidDollarAmount(value: string): boolean {
  return value === "" || /^\d*\.?\d{0,2}$/.test(value);
}

export const isTicketTypeSalesOpen = (
  ticketType: EventTicketTypesSchema | null | undefined
): boolean | null => {
  if (!ticketType) {
    return null;
  }

  return isAfterNowInPacificTime(ticketType.ticketSalesEndTime);
};
