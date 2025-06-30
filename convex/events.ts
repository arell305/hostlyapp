import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { CancelEventResponse, OrganizationSchema } from "@/types/types";
import {
  ErrorMessages,
  ShowErrorMessages,
  ResponseStatus,
  UserRole,
} from "@/types/enums";
import { Id } from "./_generated/dataModel";
import { PaginationResult, paginationOptsValidator } from "convex/server";
import {
  AddEventResponse,
  GetEventByIdResponse,
  UpdateEventResponse,
  GetEventsByMonthResponse,
  GetEventWithTicketsData,
} from "@/types/convex-types";
import { TIME_ZONE } from "@/types/constants";
import {
  EventSchema,
  EventTicketTypesSchema,
  GuestListInfoSchema,
  PromoterPromoCodeSchema,
  UserSchema,
} from "@/types/schemas-types";
import { getCurrentTime } from "../utils/luxon";
import { internal } from "./_generated/api";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateEvent,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import {
  getTicketSoldCounts,
  handleError,
  handleGuestListData,
  handleGuestListUpdateData,
  handleTicketData,
  handleTicketUpdateData,
  hasTicketDataChanged,
  isUserInOrganization,
  performAddEventCleanup,
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
  handler: async (ctx, args): Promise<AddEventResponse> => {
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

    try {
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
          identity.id as string
        );
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: { eventId, guestListInfoId },
      };
    } catch (error) {
      await performAddEventCleanup(ctx, eventId, eventTicketTypesIds);

      return handleError(error);
    }
  },
});

export const getEventById = query({
  args: { eventId: v.string() },
  handler: async (ctx, { eventId }): Promise<GetEventByIdResponse> => {
    try {
      const normalizedId = ctx.db.normalizeId("events", eventId);
      if (!normalizedId) {
        throw new Error(ShowErrorMessages.EVENT_NOT_FOUND);
      }

      const event = validateEvent(await ctx.db.get(normalizedId));

      const { ticketSoldCounts, ticketTypes } = await getTicketSoldCounts(
        ctx,
        event._id
      );

      const guestListInfo: GuestListInfoSchema | null = await ctx.db
        .query("guestListInfo")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .first();

      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.SUCCESS,
          data: {
            event,
            ticketTypes,
            ticketSoldCounts,
          },
        };
      }
      const organization = await ctx.db.get(event.organizationId);
      const validatedOrganization = validateOrganization(organization);
      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          event,
          ticketTypes,
          guestListInfo,
          ticketSoldCounts,
        },
      };
    } catch (error) {
      return handleError(error);
    }
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
        name: v.string(),
        price: v.number(),
        capacity: v.number(),
        stripeProductId: v.string(),
        stripePriceId: v.string(),
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
  handler: async (ctx, args): Promise<UpdateEventResponse> => {
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

    try {
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

      const guestListInfoId: Id<"guestListInfo"> | null =
        await handleGuestListUpdateData(
          ctx,
          validatedOrganization,
          eventId,
          guestListData,
          identity.id as string
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

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          eventId,
          guestListInfoId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const cancelEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args): Promise<CancelEventResponse> => {
    const { eventId } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const event: EventSchema | null = await ctx.db.get(eventId);
      const validatedEvent = validateEvent(event, false);

      const organization: OrganizationSchema | null = await ctx.db.get(
        validatedEvent.organizationId
      );
      const validatedOrganization = validateOrganization(organization);

      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

      await ctx.db.patch(validatedEvent._id, { isActive: false });
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          eventId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getEventsByMonth = query({
  args: {
    organizationId: v.id("organizations"),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args): Promise<GetEventsByMonthResponse> => {
    const { organizationId, year, month } = args;

    const startDate = DateTime.fromObject(
      { year, month, day: 1 },
      { zone: TIME_ZONE }
    ).startOf("month");

    const endDate = DateTime.fromObject(
      { year, month },
      { zone: TIME_ZONE }
    ).endOf("month");

    try {
      const identity = await requireAuthenticatedUser(ctx);
      const organization = validateOrganization(
        await ctx.db.get(organizationId)
      );
      isUserInOrganization(identity, organization.clerkOrganizationId);

      // Step 1: Fetch events
      const events = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("organizationId"), organization._id))
        .filter((q) => q.gte(q.field("startTime"), startDate.toMillis()))
        .filter((q) => q.lte(q.field("startTime"), endDate.toMillis()))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      // Step 2: For each event, fetch guestListInfo and ticketTypes
      const eventData: (EventSchema & {
        guestListInfo: GuestListInfoSchema | null;
        ticketTypes: EventTicketTypesSchema[];
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

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          eventData,
        },
      };
    } catch (error) {
      return handleError(error);
    }
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
    try {
      const eventId: Id<"events"> = await ctx.db.insert("events", {
        organizationId: args.organizationId,
        name: args.name,
        description: args.description,
        startTime: args.startTime,
        endTime: args.endTime,
        photo: args.photo,
        address: args.address,
        isActive: true,
      });

      return eventId;
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error(ErrorMessages.EVENT_DB_CREATE_ERROR);
    }
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

    try {
      validateEvent(await ctx.db.get(eventId));

      const fieldsToUpdate = Object.fromEntries(
        Object.entries(updateFields).filter(([_, value]) => value !== undefined)
      );

      await ctx.db.patch(eventId, fieldsToUpdate);

      return eventId;
    } catch (error) {
      console.error("Error updating event:", error);
      throw new Error(ErrorMessages.EVENT_DB_UPDATE);
    }
  },
});

export const getEventsWithTickets = internalQuery({
  args: { eventId: v.id("events"), promoCode: v.union(v.string(), v.null()) },
  handler: async (ctx, args): Promise<GetEventWithTicketsData> => {
    const { eventId, promoCode } = args;
    try {
      const event = validateEvent(await ctx.db.get(eventId));

      let promoterUserId: Id<"users"> | null = null;

      if (promoCode) {
        const normalizedInputName = promoCode.toLowerCase();
        const promoterPromoCode: PromoterPromoCodeSchema | null = await ctx.db
          .query("promoterPromoCode")
          .withIndex("by_name", (q) => q.eq("name", normalizedInputName))
          .unique();

        if (!promoterPromoCode) {
          throw new Error(ShowErrorMessages.INVALID_PROMO_CODE);
        }
        const user: UserSchema | null = validateUser(
          await ctx.db.get(promoterPromoCode.promoterUserId),
          true,
          false,
          true
        );

        if (event.organizationId !== user.organizationId) {
          throw new Error(ShowErrorMessages.INVALID_PROMO_CODE);
        }
        promoterUserId = user._id;
      }

      return {
        event,
        promoterUserId,
      };
    } catch (error) {
      console.error("Error fetching event", error);
      throw new Error(ErrorMessages.EVENT_DB_QUERY);
    }
  },
});

export const deleteEvent = internalMutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args): Promise<void> => {
    const { eventId } = args;

    try {
      validateEvent(await ctx.db.get(eventId));

      await ctx.db.delete(eventId);
    } catch (error) {
      console.error(` Failed to delete event ${eventId}:`, error);
      throw new Error(ErrorMessages.EVENT_DB_DELETE);
    }
  },
});
