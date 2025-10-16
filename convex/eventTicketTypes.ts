import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

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
  },
});

export const internalDeleteEventTicketTypes = internalMutation({
  args: {
    eventTicketTypesIds: v.array(v.id("eventTicketTypes")),
  },
  handler: async (ctx, args): Promise<void> => {
    const { eventTicketTypesIds } = args;
    for (const id of eventTicketTypesIds) {
      await ctx.db.delete(id);
    }
  },
});

export const internalGetEventTicketTypesByEventId = internalQuery({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<Doc<"eventTicketTypes">[]> => {
    const { eventId } = args;

    const results = await ctx.db
      .query("eventTicketTypes")
      .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return results;
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
    activeUntil: v.optional(v.number()),
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
      activeUntil,
    } = args;

    const updates: Partial<{
      name: string;
      price: number;
      capacity: number;
      ticketSalesEndTime: number;
      isActive: boolean;
      stripePriceId: string;
      activeUntil: number;
    }> = {};

    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (capacity !== undefined) updates.capacity = capacity;
    if (ticketSalesEndTime !== undefined)
      updates.ticketSalesEndTime = ticketSalesEndTime;
    if (isActive !== undefined) updates.isActive = isActive;
    if (stripePriceId !== undefined) updates.stripePriceId = stripePriceId;
    if (activeUntil !== undefined) updates.activeUntil = activeUntil;

    await ctx.db.patch(eventTicketTypeId, updates);
  },
});

export const getEventTicketTypes = internalQuery({
  args: {
    eventTicketTypesId: v.id("eventTicketTypes"),
  },
  handler: async (ctx, args): Promise<Doc<"eventTicketTypes"> | null> => {
    const { eventTicketTypesId } = args;
    return await ctx.db.get(eventTicketTypesId);
  },
});
