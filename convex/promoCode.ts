import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const findPromoIdByCode = internalQuery({
  args: { promoCode: v.string() },
  handler: async ({ db }, { promoCode }) => {
    const promo = await db
      .query("promoCodes")
      .filter((q) => q.eq(q.field("promoCode"), promoCode))
      .first();

    if (!promo) {
      throw new Error("Promo code not found");
    }

    return promo;
  },
});
