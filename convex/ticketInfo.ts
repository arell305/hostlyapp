import { ClerkRoleEnum, ErrorMessages } from "@/types/enums";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  EventSchema,
  InsertTicektResponse,
  TicketInfoSchema,
} from "@/types/types";
import { ResponseStatus } from "../utils/enum";
import { Id } from "./_generated/dataModel";

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
    ticketSalesEndTime: v.string(),
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
    ticketSalesEndTime: v.string(),
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
