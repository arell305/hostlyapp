import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { GuestListInfoSchema } from "@/types/schemas-types";
import { ErrorMessages } from "@/types/enums";

export const createGuestListInfo = internalMutation({
  args: {
    eventId: v.id("events"),
    guestListCloseTime: v.number(),
    checkInCloseTime: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"guestListInfo">> => {
    try {
      const { eventId, guestListCloseTime, checkInCloseTime } = args;

      const guestListInfoId: Id<"guestListInfo"> = await ctx.db.insert(
        "guestListInfo",
        {
          eventId,
          guestListCloseTime,
          checkInCloseTime,
        }
      );

      await ctx.db.patch(eventId, { guestListInfoId });

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
  },
  handler: async (ctx, args): Promise<Id<"guestListInfo">> => {
    try {
      const { guestListInfoId, guestListCloseTime, checkInCloseTime } = args;

      await ctx.db.patch(guestListInfoId, {
        guestListCloseTime,
        checkInCloseTime,
      });

      return guestListInfoId;
    } catch (error) {
      console.error("Error updating guest list info:", error);
      throw new Error(ErrorMessages.GUEST_LIST_INFO_DB_UPDATE);
    }
  },
});
