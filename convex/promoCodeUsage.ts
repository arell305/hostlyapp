import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPromoCodeUsageByPromoterAndEvent = query({
  args: {
    clerkPromoterUserId: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const { clerkPromoterUserId, eventId } = args;

    // Query the promoCodeUsage table for the single record
    const usage = await ctx.db
      .query("promoCodeUsage")
      .filter((q) =>
        q.and(
          q.eq(q.field("clerkPromoterUserId"), clerkPromoterUserId),
          q.eq(q.field("eventId"), eventId)
        )
      )
      .unique();

    // If no usage found, return a structured response with zero counts
    if (!usage) {
      return {
        promoterId: clerkPromoterUserId,
        eventId: eventId,
        maleUsageCount: 0,
        femaleUsageCount: 0,
      };
    }

    // Format the result
    return {
      promoterId: clerkPromoterUserId,
      maleUsageCount: usage.maleUsageCount,
      femaleUsageCount: usage.femaleUsageCount,
      promoCodeId: usage.promoCodeId,
    };
  },
});

export const getTotalPromoCodeUsageByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const { eventId } = args;

    const usages = await ctx.db
      .query("promoCodeUsage")
      .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
      .collect();

    const totalUsage = usages.reduce(
      (acc, usage) => {
        acc.totalMaleUsage += usage.maleUsageCount;
        acc.totalFemaleUsage += usage.femaleUsageCount;
        return acc;
      },
      { totalMaleUsage: 0, totalFemaleUsage: 0 }
    );

    return totalUsage;
  },
});
