import { ErrorMessages } from "@/types/enums";
import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { EventTicketTypesSchema } from "@/types/schemas-types";

export const createEventTicketTypes = internalMutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    price: v.number(),
    capacity: v.number(),
    stripeProductId: v.string(),
    stripePriceId: v.string(),
    ticketSalesEndTime: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"eventTicketTypes">> => {
    try {
      const {
        eventId,
        name,
        price,
        capacity,
        stripeProductId,
        stripePriceId,
        ticketSalesEndTime,
      } = args;

      const eventTicketTypesId: Id<"eventTicketTypes"> = await ctx.db.insert(
        "eventTicketTypes",
        {
          eventId,
          name,
          price,
          capacity,
          stripeProductId,
          stripePriceId,
          ticketSalesEndTime,
          isActive: true,
        }
      );

      return eventTicketTypesId;
    } catch (error) {
      console.error("Error creating event ticket types:", error);
      throw new Error(ErrorMessages.EVENT_TICKET_TYPES_DB_CREATE);
    }
  },
});

export const internalDeleteEventTicketTypes = internalMutation({
  args: {
    eventTicketTypesIds: v.array(v.id("eventTicketTypes")),
  },
  handler: async (ctx, args): Promise<void> => {
    const { eventTicketTypesIds } = args;
    try {
      for (const id of eventTicketTypesIds) {
        await ctx.db.delete(id);
      }
    } catch (error) {
      console.error("Error deleting event ticket types:", error);
      throw new Error(ErrorMessages.EVENT_TICKET_TYPES_DB_DELETE);
    }
  },
});

export const internalGetEventTicketTypesByEventId = internalQuery({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<EventTicketTypesSchema[]> => {
    const { eventId } = args;
    try {
      const results = await ctx.db
        .query("eventTicketTypes")
        .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      return results;
    } catch (error) {
      console.error("Error fetching event ticket types by event ID:", error);
      throw new Error(
        ErrorMessages.EVENT_TICKET_TYPES_DB_QUERY_BY_EVENT_ID_ERROR
      );
    }
  },
});

export const internalUpdateEventTicketType = internalMutation({
  args: {
    eventTicketTypeId: v.id("eventTicketTypes"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    capacity: v.optional(v.number()),
    ticketSalesEndTime: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    stripePriceId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    const {
      eventTicketTypeId,
      name,
      price,
      capacity,
      ticketSalesEndTime,
      isActive,
      stripePriceId,
    } = args;

    try {
      const updates: Partial<{
        name: string;
        price: number;
        capacity: number;
        ticketSalesEndTime: number;
        isActive: boolean;
        stripePriceId: string;
      }> = {};

      if (name !== undefined) updates.name = name;
      if (price !== undefined) updates.price = price;
      if (capacity !== undefined) updates.capacity = capacity;
      if (ticketSalesEndTime !== undefined)
        updates.ticketSalesEndTime = ticketSalesEndTime;
      if (isActive !== undefined) updates.isActive = isActive;
      if (stripePriceId !== undefined) updates.stripePriceId = stripePriceId;

      await ctx.db.patch(eventTicketTypeId, updates);
    } catch (error) {
      console.error("Error updating event ticket type:", error);
      throw new Error(ErrorMessages.EVENT_TICKET_TYPES_DB_UPDATE);
    }
  },
});

export const getEventTicketTypes = internalQuery({
  args: {
    eventTicketTypesId: v.id("eventTicketTypes"),
  },
  handler: async (ctx, args): Promise<EventTicketTypesSchema | null> => {
    const { eventTicketTypesId } = args;
    try {
      return await ctx.db.get(eventTicketTypesId);
    } catch (error) {
      console.error("Error fetching event ticket types by event ID:", error);
      throw new Error(ErrorMessages.EVENT_TICKET_TYPES_DB_QUERY);
    }
  },
});
