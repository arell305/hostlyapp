import { internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { throwConvexError } from "./backendUtils/errors";
import { ShowErrorMessages } from "@/shared/types/enums";

export const findPromoIdByCode = internalQuery({
  args: { promoCode: v.string() },
  handler: async ({ db }, { promoCode }) => {
    const promo = await db
      .query("promoCodes")
      .filter((q) => q.eq(q.field("promoCode"), promoCode))
      .first();

    if (!promo) {
      throwConvexError(ShowErrorMessages.INVALID_PROMO_CODE, {
        code: "NOT_FOUND",
        showToUser: true,
      });
    }

    return promo;
  },
});
