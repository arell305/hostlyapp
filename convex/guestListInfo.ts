import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const createGuestListInfo = internalMutation({
  args: {
    eventId: v.id("events"),
    guestListCloseTime: v.number(),
    checkInCloseTime: v.number(),
    guestListRules: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"guestListInfo">> => {
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
  },
});

export const getGuestListInfoByEventId = internalQuery({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<Doc<"guestListInfo"> | null> => {
    return await ctx.db
      .query("guestListInfo")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .first();
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
  },
});
