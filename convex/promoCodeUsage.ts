import { ErrorMessages } from "@/utils/enums";
import { ResponseStatus } from "../utils/enum";
import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  GetPromoCodeUsageByPromoterAndEventResponse,
  GetTotalPromoCodeUsageByEventResponse,
  PromoCodeUsage,
  PromoCodeUsageData,
  TotalUsage,
} from "@/types";

export const getPromoCodeUsageByPromoterAndEvent = query({
  args: {
    clerkPromoterUserId: v.string(),
    eventId: v.id("events"),
  },
  handler: async (
    ctx,
    args
  ): Promise<GetPromoCodeUsageByPromoterAndEventResponse> => {
    const { clerkPromoterUserId, eventId } = args;

    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const usage: PromoCodeUsage | null = await ctx.db
        .query("promoCodeUsage")
        .filter((q) =>
          q.and(
            q.eq(q.field("clerkPromoterUserId"), clerkPromoterUserId),
            q.eq(q.field("eventId"), eventId)
          )
        )
        .unique();

      const usageData: PromoCodeUsageData = usage
        ? {
            promoterId: usage.clerkPromoterUserId,
            maleUsageCount: usage.maleUsageCount,
            femaleUsageCount: usage.femaleUsageCount,
            promoCodeId: usage.promoCodeId,
          }
        : {
            promoterId: clerkPromoterUserId,
            maleUsageCount: 0,
            femaleUsageCount: 0,
            promoCodeId: null,
          };

      return {
        status: ResponseStatus.SUCCESS,
        data: usageData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const getTotalPromoCodeUsageByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (
    ctx,
    args
  ): Promise<GetTotalPromoCodeUsageByEventResponse> => {
    const { eventId } = args;

    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const usages: PromoCodeUsage[] = await ctx.db
        .query("promoCodeUsage")
        .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
        .collect();

      const totalUsage: TotalUsage = usages.reduce(
        (acc, usage) => {
          acc.totalMaleUsage += usage.maleUsageCount;
          acc.totalFemaleUsage += usage.femaleUsageCount;
          return acc;
        },
        { totalMaleUsage: 0, totalFemaleUsage: 0 }
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: totalUsage,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});
