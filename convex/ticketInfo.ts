import { ErrorMessages } from "@/types/enums";
import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { TicketInfoSchema } from "@/types/schemas-types";
import { validateTicketInfo } from "./backendUtils/validation";

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
      throw new Error(ErrorMessages.TICKET_INFO_DB_CREATE);
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
      throw new Error(ErrorMessages.TICKET_INFO_DB_QUERY_BY_EVENT_ID_ERROR);
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
      throw new Error(ErrorMessages.TICKET_INFO_DB_UPDATE);
    }
  },
});

export const deleteTicketInfo = internalMutation({
  args: { ticketInfoId: v.id("ticketInfo") },
  handler: async (ctx, args): Promise<void> => {
    const { ticketInfoId } = args;

    try {
      validateTicketInfo(await ctx.db.get(ticketInfoId));

      await ctx.db.delete(ticketInfoId);
    } catch (error) {
      console.error(`Failed to delete ticket info ${ticketInfoId}:`, error);
      throw new Error(ErrorMessages.TICKET_INFO_DB_DELETE);
    }
  },
});
