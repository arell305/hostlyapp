import { ClerkRoleEnum } from "@/utils/enums";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get ticket info by ID (as we discussed earlier)
export const getTicketInfoById = query({
  args: { ticketInfoId: v.id("ticketInfo") },
  handler: async (ctx, args) => {
    const ticketInfo = await ctx.db.get(args.ticketInfoId);
    if (!ticketInfo) {
      throw new Error("Ticket information not found");
    }
    return ticketInfo;
  },
});

export const insertTicketInfo = mutation({
  args: {
    eventId: v.id("events"),
    maleTicketPrice: v.number(),
    femaleTicketPrice: v.number(),
    maleTicketCapacity: v.number(),
    femaleTicketCapacity: v.number(),
  },
  handler: async (ctx, args) => {
    // Get the user's identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Check if the event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if ticket info already exists for this event
    const existingTicketInfo = await ctx.db
      .query("ticketInfo")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();

    if (existingTicketInfo) {
      throw new Error("Ticket information already exists for this event");
    }

    // Insert the new ticket info
    const ticketInfoId = await ctx.db.insert("ticketInfo", {
      eventId: args.eventId,
      maleTicketPrice: args.maleTicketPrice,
      femaleTicketPrice: args.femaleTicketPrice,
      maleTicketCapacity: args.maleTicketCapacity,
      femaleTicketCapacity: args.femaleTicketCapacity,
      totalMaleTicketsSold: 0,
      totalFemaleTicketsSold: 0,
    });

    // Update the event with the new ticketInfoId
    await ctx.db.patch(args.eventId, { ticketInfoId });

    return ticketInfoId;
  },
});

export const updateTicketInfo = mutation({
  args: {
    ticketInfoId: v.id("ticketInfo"),
    maleTicketPrice: v.number(),
    femaleTicketPrice: v.number(),
    maleTicketCapacity: v.number(),
    femaleTicketCapacity: v.number(),
  },
  handler: async (ctx, args) => {
    const {
      ticketInfoId,
      maleTicketPrice,
      femaleTicketPrice,
      maleTicketCapacity,
      femaleTicketCapacity,
    } = args;

    // Fetch the existing ticket info
    const existingTicketInfo = await ctx.db.get(ticketInfoId);
    if (!existingTicketInfo) {
      throw new Error("Ticket info not found");
    }

    // Update the ticket info
    const updatedTicketInfo = await ctx.db.patch(ticketInfoId, {
      maleTicketPrice,
      femaleTicketPrice,
      maleTicketCapacity,
      femaleTicketCapacity,
    });

    return updatedTicketInfo;
  },
});

export const deleteTicketInfoAndUpdateEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const { eventId } = args;

    // Find the ticketInfo associated with the event
    const ticketInfo = await ctx.db
      .query("ticketInfo")
      .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
      .unique();

    if (ticketInfo) {
      // Delete the ticketInfo
      await ctx.db.delete(ticketInfo._id);
    }

    // Update the event to set ticketInfo to undefined
    await ctx.db.patch(eventId, { ticketInfoId: undefined });

    return {
      success: true,
      message: "TicketInfo deleted and event updated successfully",
    };
  },
});
