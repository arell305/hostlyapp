import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getEventsByOrgAndDate = query({
  args: {
    clerkOrganizationId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .filter((q) =>
        q.and(
          q.eq(q.field("clerkOrganizationId"), args.clerkOrganizationId),
          q.eq(q.field("date"), args.date)
        )
      )
      .collect();

    return events || [];
  },
});

export const addEvent = mutation({
  args: {
    clerkOrganizationId: v.string(),
    name: v.string(),
    date: v.string(),
    description: v.union(v.string(), v.null()),
    startTime: v.string(),
    endTime: v.union(v.string(), v.null()),
    guestListCloseTime: v.union(v.string(), v.null()),
    photo: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      clerkOrganizationId: args.clerkOrganizationId,
      name: args.name,
      date: args.date,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      guestListCloseTime: args.guestListCloseTime,
      photo: args.photo,
      guestListIds: [],
    });

    // Update the organization's eventIds array
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_clerkOrganizationId", (q) =>
        q.eq("clerkOrganizationId", args.clerkOrganizationId)
      )
      .first();

    if (organization) {
      await ctx.db.patch(organization._id, {
        eventIds: [...organization.eventIds, eventId],
      });
    }

    return eventId;
  },
});

export const getEventById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    let ticketInfo = null;
    if (event.ticketInfoId) {
      ticketInfo = await ctx.db.get(event.ticketInfoId);
    }

    return {
      ...event,
      ticketInfo,
    };
  },
});

export const getEventWithGuestLists = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const { eventId } = args;

    // Fetch the event
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Fetch all guest lists associated with this event
    const guestLists = await ctx.db
      .query("guestLists")
      .filter((q) => q.eq(q.field("eventId"), eventId))
      .collect();

    // Fetch promoter information
    const promoterIds = Array.from(
      new Set(guestLists.map((gl) => gl.clerkPromoterId))
    );
    const promoters = await Promise.all(
      promoterIds.map(async (promoterId) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), promoterId))
          .first();
        return { id: promoterId, name: user?.name || "Unknown" };
      })
    );

    // Create a map of promoter IDs to names for quick lookup
    const promoterMap = new Map(promoters.map((p) => [p.id, p.name]));

    // Combine all guest names from all guest lists, sort them, and add promoter info
    const allGuests = guestLists.flatMap((guestList) =>
      guestList.names.map((guest) => ({
        ...guest,
        promoterId: guestList.clerkPromoterId,
        promoterName: promoterMap.get(guestList.clerkPromoterId) || "Unknown",
        guestListId: guestList._id,
      }))
    );

    // Calculate totals
    const totalMales = allGuests.reduce(
      (sum, guest) => sum + (guest.malesInGroup || 0),
      0
    );
    const totalFemales = allGuests.reduce(
      (sum, guest) => sum + (guest.femalesInGroup || 0),
      0
    );

    // Sort the guests alphabetically by name
    const sortedGuests = allGuests.sort((a, b) => a.name.localeCompare(b.name));

    return {
      event,
      guests: sortedGuests,
      totalMales,
      totalFemales,
    };
  },
});

export const updateGuestAttendance = mutation({
  args: {
    guestListId: v.id("guestLists"),
    guestId: v.string(),
    attended: v.boolean(),
    malesInGroup: v.number(),
    femalesInGroup: v.number(),
  },
  handler: async (ctx, args) => {
    const { guestListId, guestId, attended, malesInGroup, femalesInGroup } =
      args;

    // Fetch the current guest list
    const guestList = await ctx.db.get(guestListId);
    if (!guestList) {
      throw new Error("Guest list not found");
    }

    // Find and update the specific guest
    const updatedNames = guestList.names.map((guest) => {
      if (guest.id === guestId) {
        return {
          ...guest,
          attended,
          malesInGroup,
          femalesInGroup,
          // Only set checkInTime if it's not already set and the guest is now attending
          checkInTime:
            guest.checkInTime ||
            (attended ? new Date().toISOString() : undefined),
        };
      }
      return guest;
    });

    // Update the guest list without recalculating totals
    await ctx.db.patch(guestListId, {
      names: updatedNames,
    });

    return {
      success: true,
      updatedGuest: updatedNames.find((g) => g.id === guestId),
    };
  },
});

export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    date: v.optional(v.string()),
    startTime: v.optional(v.union(v.string(), v.null())),
    endTime: v.optional(v.union(v.string(), v.null())),
    guestListCloseTime: v.optional(v.union(v.string(), v.null())),
    photo: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const { id, ...updateFields } = args;

    // Optional: Check if the user has permission to update this event
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) throw new Error("Unauthenticated");
    // ... additional permission checks ...

    // Remove undefined fields
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(updateFields).filter(([_, v]) => v !== undefined)
    );

    // Update the event
    const updatedEvent = await ctx.db.patch(id, fieldsToUpdate);

    return updatedEvent;
  },
});
