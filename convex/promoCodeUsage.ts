import { ErrorMessages } from "@/types/enums";
import { ResponseStatus } from "../utils/enum";
import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  GetPromoCodeUsageByPromoterAndEventResponse,
  GetTotalPromoCodeUsageByEventResponse,
  PromoCodeUsage,
  PromoCodeUsageData,
  TotalUsage,
  UserSchema,
} from "@/types/types";
import { requireAuthenticatedUser } from "../utils/auth";
import { validateEvent, validateUser } from "./backendUtils/validation";
import { isUserInCompanyOfEvent } from "./backendUtils/helper";

export const getPromoCodeUsageByPromoterAndEvent = query({
  args: {
    promoterUserId: v.id("users"),
    eventId: v.id("events"),
  },
  handler: async (
    ctx,
    args
  ): Promise<GetPromoCodeUsageByPromoterAndEventResponse> => {
    const { promoterUserId, eventId } = args;

    try {
      await requireAuthenticatedUser(ctx);

      const user: UserSchema | null = await ctx.db.get(promoterUserId);

      const validatedUser = validateUser(user);

      const event = await ctx.db.get(eventId);
      const validatedEvent = validateEvent(event);
      isUserInCompanyOfEvent(validatedUser, validatedEvent);

      const usage: PromoCodeUsage | null = await ctx.db
        .query("promoCodeUsage")
        .filter((q) =>
          q.and(
            q.eq(q.field("promoterUserId"), validatedUser._id),
            q.eq(q.field("eventId"), eventId)
          )
        )
        .first();

      const usageData: PromoCodeUsageData = usage
        ? {
            promoterUserId: usage.promoterUserId || validatedUser._id,
            maleUsageCount: usage.maleUsageCount,
            femaleUsageCount: usage.femaleUsageCount,
            promoCodeId: usage.promoCodeId,
          }
        : {
            promoterUserId: validatedUser._id,
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
          status: ResponseStatus.ERROR,
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
