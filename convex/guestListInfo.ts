import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const insertGuestListInfo = mutation({
  args: {
    eventId: v.id("events"),
    guestListCloseTime: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the user's identity from Clerk

    // Check if the event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Insert the new guest list info
    const guestListInfoId = await ctx.db.insert("guestListInfo", {
      eventId: args.eventId,
      guestListCloseTime: args.guestListCloseTime,
      guestListIds: [],
    });

    // Update the event with the new guest list info Id
    await ctx.db.patch(args.eventId, { guestListInfoId });

    return guestListInfoId;
  },
});

export const deleteGuestListInfoAndUpdateEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const { eventId } = args;

    const guestListInfo = await ctx.db
      .query("guestListInfo")
      .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
      .unique();

    if (guestListInfo) {
      await ctx.db.delete(guestListInfo._id);
    }

    await ctx.db.patch(eventId, { guestListInfoId: undefined });

    return {
      success: true,
      message: "GuestListInfo deleted and event updated successfully",
    };
  },
});

export const updateGuestListCloseTime = mutation({
  args: {
    guestListInfoId: v.id("guestListInfo"),
    guestListCloseTime: v.string(),
  },
  handler: async (ctx, args) => {
    const { guestListInfoId, guestListCloseTime } = args;

    await ctx.db.patch(guestListInfoId, {
      guestListCloseTime: guestListCloseTime,
    });
  },
});
