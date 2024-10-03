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
    startTime: v.union(v.string(), v.null()),
    endTime: v.union(v.string(), v.null()),
    guestListUploadTime: v.union(v.string(), v.null()),
    maleTicketPrice: v.union(v.string(), v.null()),
    femaleTicketPrice: v.union(v.string(), v.null()),
    maleTicketCapacity: v.union(v.string(), v.null()),
    femaleTicketCapacity: v.union(v.string(), v.null()),
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
      guestListUploadTime: args.guestListUploadTime,
      maleTicketPrice: args.maleTicketPrice,
      femaleTicketPrice: args.femaleTicketPrice,
      maleTicketCapacity: args.maleTicketCapacity,
      femaleTicketCapacity: args.femaleTicketCapacity,
      photo: args.photo,
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
