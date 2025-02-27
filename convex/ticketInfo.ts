import { ClerkRoleEnum, ErrorMessages, Gender } from "@/types/enums";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { InsertTicektResponse } from "@/types/types";
import { ResponseStatus } from "../utils/enum";
import { Id } from "./_generated/dataModel";
import { EventSchema, TicketInfoSchema } from "@/types/schemas-types";
import { stripe } from "../utils/stripe";
import { USD_CURRENCY } from "@/types/constants";

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
    ticketSalesEndTime: v.number(),
  },
  handler: async (ctx, args): Promise<InsertTicektResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const event: EventSchema | null = await ctx.db.get(args.eventId);
      if (!event) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const ticketInfoId: Id<"ticketInfo"> = await ctx.db.insert("ticketInfo", {
        eventId: args.eventId,
        maleTicketPrice: args.maleTicketPrice,
        femaleTicketPrice: args.femaleTicketPrice,
        maleTicketCapacity: args.maleTicketCapacity,
        femaleTicketCapacity: args.femaleTicketCapacity,
        ticketSalesEndTime: args.ticketSalesEndTime,
      });
      await ctx.db.patch(args.eventId, { ticketInfoId });

      return {
        status: ResponseStatus.SUCCESS,
        data: ticketInfoId,
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

export const updateTicketInfo = mutation({
  args: {
    ticketInfoId: v.id("ticketInfo"),
    maleTicketPrice: v.number(),
    femaleTicketPrice: v.number(),
    maleTicketCapacity: v.number(),
    femaleTicketCapacity: v.number(),
    ticketSalesEndTime: v.number(),
  },
  handler: async (ctx, args) => {
    const {
      ticketInfoId,
      maleTicketPrice,
      femaleTicketPrice,
      maleTicketCapacity,
      femaleTicketCapacity,
      ticketSalesEndTime,
    } = args;
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const existingTicketInfo: TicketInfoSchema | null =
        await ctx.db.get(ticketInfoId);
      if (!existingTicketInfo) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }
      await ctx.db.patch(ticketInfoId, {
        maleTicketPrice,
        femaleTicketPrice,
        maleTicketCapacity,
        femaleTicketCapacity,
        ticketSalesEndTime,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          ticketInfoId: existingTicketInfo._id,
        },
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

// export const deleteTicketInfoAndUpdateEvent = mutation({
//   args: { eventId: v.id("events") },
//   handler: async (ctx, args) => {
//     const { eventId } = args;

//     // Find the ticketInfo associated with the event
//     const ticketInfo = await ctx.db
//       .query("ticketInfo")
//       .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
//       .unique();

//     if (ticketInfo) {
//       // Delete the ticketInfo
//       await ctx.db.delete(ticketInfo._id);
//     }

//     // Update the event to set ticketInfo to undefined
//     await ctx.db.patch(eventId, { ticketInfoId: undefined });

//     return {
//       success: true,
//       message: "TicketInfo deleted and event updated successfully",
//     };
//   },
// });
export const createTicketInfo = internalMutation({
  args: {
    eventId: v.id("events"),
    ticketSalesEndTime: v.number(),
    stripeProductId: v.string(),
    ticketTypes: v.object({
      male: v.object({
        price: v.number(),
        capacity: v.number(),
        stripePriceId: v.string(),
      }),
      female: v.object({
        price: v.number(),
        capacity: v.number(),
        stripePriceId: v.string(),
      }),
    }),
  },
  handler: async (ctx, args): Promise<Id<"ticketInfo">> => {
    try {
      const { eventId, ticketSalesEndTime, stripeProductId, ticketTypes } =
        args;

      const ticketInfoId: Id<"ticketInfo"> = await ctx.db.insert("ticketInfo", {
        eventId,
        ticketSalesEndTime,
        stripeProductId,
        ticketTypes,
      });
      await ctx.db.patch(eventId, { ticketInfoId });

      return ticketInfoId;
    } catch (error) {
      console.error("Error creating ticket info:", error);
      throw new Error("Failed to create ticket info");
    }
  },
});

export const getTicketInfoByEventId = internalQuery({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<TicketInfoSchema | null> => {
    try {
      return await ctx.db
        .query("ticketInfo")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .first();
    } catch (error) {
      console.error("Error fetching ticket info by event ID:", error);
      throw new Error("Failed to fetch ticket info");
    }
  },
});

export const internalUpdateTicketInfo = internalMutation({
  args: {
    ticketInfoId: v.id("ticketInfo"),
    maleTicketPrice: v.number(),
    femaleTicketPrice: v.number(),
    maleTicketCapacity: v.number(),
    femaleTicketCapacity: v.number(),
    ticketSalesEndTime: v.number(),
    stripeMalePriceId: v.string(),
    stripeFemalePriceId: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"ticketInfo">> => {
    try {
      const {
        ticketInfoId,
        maleTicketPrice,
        femaleTicketPrice,
        maleTicketCapacity,
        femaleTicketCapacity,
        ticketSalesEndTime,
        stripeMalePriceId,
        stripeFemalePriceId,
      } = args;

      await ctx.db.patch(ticketInfoId, {
        ticketTypes: {
          male: {
            price: maleTicketPrice,
            capacity: maleTicketCapacity,
            stripePriceId: stripeMalePriceId,
          },
          female: {
            price: femaleTicketPrice,
            capacity: femaleTicketCapacity,
            stripePriceId: stripeFemalePriceId,
          },
        },
        ticketSalesEndTime,
      });

      return ticketInfoId;
    } catch (error) {
      console.error("Error updating ticket info:", error);
      throw new Error("Failed to update ticket info");
    }
  },
});
