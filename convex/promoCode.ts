import { internalQuery } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const findPromoIdByCode = internalQuery({
  args: { promoCode: v.string() },
  handler: async ({ db }, { promoCode }) => {
    const promo = await db
      .query("promoCodes")
      .filter((q) => q.eq(q.field("promoCode"), promoCode))
      .first();

    if (!promo) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Promo code not found",
      });
    }

    return promo;
  },
});
