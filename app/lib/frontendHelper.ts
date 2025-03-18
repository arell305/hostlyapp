import {
  TicketInfoSchema,
  PromoterPromoCodeWithDiscount,
} from "@/types/schemas-types";
import { isAfterNowInPacificTime } from "../../utils/luxon";

export interface TicketPricing {
  discountedMalePrice: number;
  discountedFemalePrice: number;
  totalMalePrice: number;
  totalFemalePrice: number;
  totalPrice: number;
  totalDiscount: number;
  discountAmount: number;
}

export const calculateTicketPricing = (
  ticketInfoData: TicketInfoSchema | null | undefined,
  maleCount: number,
  femaleCount: number,
  validationResult: PromoterPromoCodeWithDiscount | null
): TicketPricing => {
  const discountAmount = validationResult?.promoDiscount || 0;

  const malePrice = ticketInfoData?.ticketTypes?.male?.price ?? 0;
  const femalePrice = ticketInfoData?.ticketTypes?.female?.price ?? 0;

  const discountedMalePrice = Math.max(malePrice - discountAmount, 0);
  const discountedFemalePrice = Math.max(femalePrice - discountAmount, 0);

  const totalMalePrice = maleCount * discountedMalePrice;
  const totalFemalePrice = femaleCount * discountedFemalePrice;
  const totalPrice = totalMalePrice + totalFemalePrice;
  const totalDiscount = (maleCount + femaleCount) * discountAmount;

  return {
    discountedMalePrice,
    discountedFemalePrice,
    totalMalePrice,
    totalFemalePrice,
    totalPrice,
    totalDiscount,
    discountAmount,
  };
};

export const isTicketSalesOpen = (
  ticketInfoData: TicketInfoSchema | null | undefined
): boolean | null => {
  if (!ticketInfoData) {
    return null;
  }
  return isAfterNowInPacificTime(ticketInfoData.ticketSalesEndTime);
};
