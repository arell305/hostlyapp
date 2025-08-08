import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { GuestListInfoSchema } from "@/types/schemas-types";
import {
  ErrorMessages,
  ResponseStatus,
  ShowErrorMessages,
} from "@/types/enums";
import { PublicGetGuestListInfoByEventIdResponse } from "@/types/convex-types";
import { handleError } from "./backendUtils/helper";
import {
  validateEvent,
  validateGuestListInfo,
} from "./backendUtils/validation";

export const createGuestListInfo = internalMutation({
  args: {
    eventId: v.id("events"),
    guestListCloseTime: v.number(),
    checkInCloseTime: v.number(),
    guestListRules: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"guestListInfo">> => {
    try {
      const { eventId, guestListCloseTime, checkInCloseTime, guestListRules } =
        args;

      const guestListInfoId: Id<"guestListInfo"> = await ctx.db.insert(
        "guestListInfo",
        {
          eventId,
          guestListCloseTime,
          checkInCloseTime,
          guestListRules,
        }
      );

      return guestListInfoId;
    } catch (error) {
      console.error("Error creating guest list info:", error);
      throw new Error(ErrorMessages.GUEST_LIST_INFO_DB_CREATE);
    }
  },
});

export const getGuestListInfoByEventId = internalQuery({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<GuestListInfoSchema | null> => {
    try {
      return await ctx.db
        .query("guestListInfo")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .first();
    } catch (error) {
      console.error("Error fetching guest list info by event ID:", error);
      throw new Error(ErrorMessages.GUEST_LIST_INFO_DB_QUERY);
    }
  },
});

export const updateGuestListInfo = internalMutation({
  args: {
    guestListInfoId: v.id("guestListInfo"),
    guestListCloseTime: v.number(),
    checkInCloseTime: v.number(),
    guestListRules: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"guestListInfo">> => {
    try {
      const {
        guestListInfoId,
        guestListCloseTime,
        checkInCloseTime,
        guestListRules,
      } = args;

      await ctx.db.patch(guestListInfoId, {
        guestListCloseTime,
        checkInCloseTime,
        guestListRules,
      });

      return guestListInfoId;
    } catch (error) {
      console.error("Error updating guest list info:", error);
      throw new Error(ErrorMessages.GUEST_LIST_INFO_DB_UPDATE);
    }
  },
});

export const publicGetGuestListInfoByEventId = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (
    ctx,
    args
  ): Promise<PublicGetGuestListInfoByEventIdResponse> => {
    try {
      const event = validateEvent(await ctx.db.get(args.eventId));
      const guestListInfo = validateGuestListInfo(
        await ctx.db
          .query("guestListInfo")
          .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
          .first()
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          event,
          guestListInfo,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
