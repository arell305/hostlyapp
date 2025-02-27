import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";

export const insertConnectedPayment = internalMutation({
  args: {
    eventId: v.id("events"),
    stripePaymentIntentId: v.string(),
    email: v.string(),
    totalAmount: v.number(),
    promoCode: v.union(v.string(), v.null()),
    maleCount: v.number(),
    femaleCount: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"connectedPayments">> => {
    const {
      eventId,
      stripePaymentIntentId,
      email,
      totalAmount,
      promoCode,
      maleCount,
      femaleCount,
      status,
    } = args;

    try {
      const paymentId: Id<"connectedPayments"> = await ctx.db.insert(
        "connectedPayments",
        {
          eventId,
          stripePaymentIntentId,
          email,
          totalAmount,
          promoCode,
          maleCount,
          femaleCount,
          status,
        }
      );

      return paymentId;
    } catch (error) {
      console.error("Error inserting payment record:", error);
      throw new Error("Failed to insert payment record.");
    }
  },
});
