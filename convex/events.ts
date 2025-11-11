import { ConvexError, v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { ShowErrorMessages, UserRole } from "@/shared/types/enums";
import { Doc, Id } from "./_generated/dataModel";
import {
  GetEventWithTicketsData,
  GetEventByIdData,
  EventWithExtras,
} from "@/shared/types/convex-types";
import { TIME_ZONE } from "@/shared/types/constants";

import { internal } from "./_generated/api";
import { requireAuthenticatedUser } from "../shared/utils/auth";
import {
  validateEvent,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import {
  getTicketSoldCounts,
  handleGuestListData,
  handleGuestListUpdateData,
  handleTicketData,
  handleTicketUpdateData,
  hasTicketDataChanged,
  isUserInOrganization,
} from "./backendUtils/helper";
import { DateTime } from "luxon";

export const addEvent = action({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    startTime: v.number(),
    endTime: v.number(),
    photo: v.id("_storage"),
    address: v.string(),
    ticketData: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
        capacity: v.number(),
        ticketSalesEndTime: v.number(),
      })
    ),
    guestListData: v.union(
      v.object({
        guestListCloseTime: v.number(),
        checkInCloseTime: v.number(),
        guestListRules: v.string(),
      }),
      v.null()
    ),
  },
  handler: async (ctx, args): Promise<Id<"events">> => {
    const {
      organizationId,
      name,
      description,
      startTime,
      endTime,
      photo,
      address,
      ticketData,
      guestListData,
    } = args;

    let eventId: Id<"events"> | null = null;
    let guestListInfoId: Id<"guestListInfo"> | null = null;
    let eventTicketTypesIds: Id<"eventTicketTypes">[] = [];

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Manager,
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
    ]);
    const organization = validateOrganization(
      await ctx.runQuery(internal.organizations.getOrganizationById, {
        organizationId,
      })
    );
    isUserInOrganization(identity, organization.clerkOrganizationId);

    eventId = await ctx.runMutation(internal.events.createEvent, {
      organizationId: organization._id,
      name,
      description,
      startTime,
      endTime,
      photo,
      address,
    });

    if (ticketData.length > 0) {
      eventTicketTypesIds = await handleTicketData(
        ctx,
        eventId,
        ticketData,
        organization
      );
    }

    if (guestListData) {
      guestListInfoId = await handleGuestListData(
        ctx,
        organization,
        eventId,
        guestListData,
        identity.convexUserId as Id<"users">
      );
    }

    return eventId;
  },
});

export const getEventById = query({
  args: { eventId: v.string() },
  handler: async (ctx, { eventId }): Promise<GetEventByIdData> => {
    const normalizedId = ctx.db.normalizeId("events", eventId);
    if (!normalizedId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ShowErrorMessages.EVENT_NOT_FOUND,
      });
    }

    const event = validateEvent(await ctx.db.get(normalizedId));

    const { ticketSoldCounts, ticketTypes } = await getTicketSoldCounts(
      ctx,
      event._id
    );

    const guestListInfo = await ctx.db
      .query("guestListInfo")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .first();

    return {
      event,
      ticketTypes,
      guestListInfo,
      ticketSoldCounts,
    };
  },
});

export const updateEvent = action({
  args: {
    organizationId: v.id("organizations"),
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    photo: v.optional(v.id("_storage")),
    address: v.optional(v.string()),
    ticketData: v.array(
      v.object({
        eventTicketTypeId: v.optional(v.id("eventTicketTypes")),
        name: v.string(),
        price: v.number(),
        capacity: v.number(),
        stripeProductId: v.optional(v.string()),
        stripePriceId: v.optional(v.string()),
        ticketSalesEndTime: v.number(),
      })
    ),
    guestListData: v.union(
      v.object({
        guestListCloseTime: v.number(),
        checkInCloseTime: v.number(),
        guestListRules: v.string(),
      }),
      v.null()
    ),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const {
      eventId,
      organizationId,
      name,
      description,
      startTime,
      endTime,
      photo,
      address,
      ticketData,
      guestListData,
    } = args;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Manager,
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
    ]);

    const organization = await ctx.runQuery(
      internal.organizations.getOrganizationById,
      {
        organizationId,
      }
    );

    const validatedOrganization = validateOrganization(organization, true);

    isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

    const existingEventTicketTypes = await ctx.runQuery(
      internal.eventTicketTypes.internalGetEventTicketTypesByEventId,
      {
        eventId,
      }
    );

    if (hasTicketDataChanged(existingEventTicketTypes, ticketData)) {
      await handleTicketUpdateData(
        ctx,
        eventId,
        ticketData,
        validatedOrganization,
        existingEventTicketTypes
      );
    }

    await handleGuestListUpdateData(
      ctx,
      validatedOrganization,
      eventId,
      guestListData,
      identity.convexUserId as Id<"users">
    );

    await ctx.runMutation(internal.events.internalUpdateEvent, {
      eventId,
      name,
      description,
      startTime,
      endTime,
      photo,
      address,
    });

    return true;
  },
});

export const cancelEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args): Promise<boolean> => {
    const { eventId } = args;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Manager,
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
    ]);

    const event = await ctx.db.get(eventId);
    const validatedEvent = validateEvent(event, false);

    const organization = await ctx.db.get(validatedEvent.organizationId);
    const validatedOrganization = validateOrganization(organization);

    isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

    await ctx.db.patch(validatedEvent._id, { isActive: false });
    return true;
  },
});

export const getEventsByMonth = query({
  args: {
    organizationId: v.id("organizations"),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args): Promise<EventWithExtras[]> => {
    const { organizationId, year, month } = args;

    const startDate = DateTime.fromObject(
      { year, month, day: 1 },
      { zone: TIME_ZONE }
    ).startOf("month");

    const endDate = DateTime.fromObject(
      { year, month },
      { zone: TIME_ZONE }
    ).endOf("month");

    const identity = await requireAuthenticatedUser(ctx);
    const organization = validateOrganization(await ctx.db.get(organizationId));
    isUserInOrganization(identity, organization.clerkOrganizationId);

    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("organizationId"), organization._id))
      // .filter((q) => q.gte(q.field("startTime"), startDate.toMillis()))
      // .filter((q) => q.lte(q.field("startTime"), endDate.toMillis()))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const eventData: (Doc<"events"> & {
      guestListInfo: Doc<"guestListInfo"> | null;
      ticketTypes: Doc<"eventTicketTypes">[];
    })[] = await Promise.all(
      events.map(async (event) => {
        const [guestListInfo] = await ctx.db
          .query("guestListInfo")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .collect();

        const ticketTypes = await ctx.db
          .query("eventTicketTypes")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .collect();

        return {
          ...event,
          guestListInfo: guestListInfo || null,
          ticketTypes,
        };
      })
    );

    return eventData;
  },
});

export const createEvent = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    startTime: v.number(),
    endTime: v.number(),
    photo: v.id("_storage"),
    address: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"events">> => {
    return await ctx.db.insert("events", {
      organizationId: args.organizationId,
      name: args.name,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      photo: args.photo,
      address: args.address,
      isActive: true,
    });
  },
});

export const internalUpdateEvent = internalMutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    photo: v.optional(v.id("_storage")),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"events">> => {
    const { eventId, ...updateFields } = args;

    validateEvent(await ctx.db.get(eventId));

    const fieldsToUpdate = Object.fromEntries(
      Object.entries(updateFields).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(eventId, fieldsToUpdate);

    return eventId;
  },
});

export const getEventsWithTickets = internalQuery({
  args: { eventId: v.id("events"), promoCode: v.union(v.string(), v.null()) },
  handler: async (ctx, args): Promise<GetEventWithTicketsData> => {
    const { eventId, promoCode } = args;

    const event = validateEvent(await ctx.db.get(eventId));

    let promoterUserId: Id<"users"> | null = null;

    if (promoCode) {
      const promoterPromoCode = await ctx.db
        .query("promoterPromoCode")
        .withIndex("by_name", (q) => q.eq("name", promoCode))
        .unique();

      if (!promoterPromoCode) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: ShowErrorMessages.INVALID_PROMO_CODE,
        });
      }
      const user = validateUser(
        await ctx.db.get(promoterPromoCode.promoterUserId),
        true,
        false,
        true
      );

      if (event.organizationId !== user.organizationId) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: ShowErrorMessages.INVALID_PROMO_CODE,
        });
      }
      promoterUserId = user._id;
    }

    return {
      event,
      promoterUserId,
    };
  },
});

export const deleteEvent = internalMutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args): Promise<void> => {
    const { eventId } = args;

    validateEvent(await ctx.db.get(eventId));

    await ctx.db.delete(eventId);
  },
});

export const getEventsForCampaign = query({
  args: {
    organizationId: v.id("organizations"),
    range: v.union(v.literal("upcoming"), v.literal("past")),
    search: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { organizationId, range, search }
  ): Promise<Doc<"events">[]> => {
    const now = Date.now();
    const limit = 30;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Manager,
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
      UserRole.Promoter,
    ]);
    const validatedOrganization = validateOrganization(
      await ctx.db.get(organizationId),
      true
    );

    isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

    if (range === "upcoming") {
      return await ctx.db
        .query("events")
        .withIndex("by_organizationId_and_startTime", (q) =>
          q.eq("organizationId", organizationId)
        )
        .filter((q) => q.gte(q.field("startTime"), now))
        .order("asc")
        .take(limit);
    }

    const keyword = search?.trim().toLowerCase() ?? "";

    if (keyword.length < 3) {
      return [];
    }

    const pastEvents = await ctx.db
      .query("events")
      .withIndex("by_organizationId_and_startTime", (q) =>
        q.eq("organizationId", organizationId)
      )
      .filter((q) => q.lt(q.field("startTime"), now))
      .order("desc")
      .take(200);

    return pastEvents
      .filter((event) => event.name.toLowerCase().includes(keyword))
      .slice(0, limit);
  },
});
