import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const createEventTicketTypes = internalMutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    price: v.number(),
    capacity: v.number(),
    description: v.union(v.string(), v.null()),
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
      description,
    } = args;

    const eventTicketTypesId: Id<"eventTicketTypes"> = await ctx.db.insert(
      "eventTicketTypes",
      {
        eventId,
        name,
        price,
        capacity,
        description,
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
    description: v.optional(v.union(v.string(), v.null())),
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
      description,
    } = args;

    const updates: Partial<{
      name: string;
      price: number;
      capacity: number;
      ticketSalesEndTime: number;
      isActive: boolean;
      stripePriceId: string;
      activeUntil: number;
      description: string | null;
    }> = {};

    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (capacity !== undefined) updates.capacity = capacity;
    if (ticketSalesEndTime !== undefined)
      updates.ticketSalesEndTime = ticketSalesEndTime;
    if (isActive !== undefined) updates.isActive = isActive;
    if (stripePriceId !== undefined) updates.stripePriceId = stripePriceId;
    if (activeUntil !== undefined) updates.activeUntil = activeUntil;
    if (description !== undefined) updates.description = description;

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
