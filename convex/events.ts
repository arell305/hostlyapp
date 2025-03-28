import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import {
  AllGuestSchema,
  CancelEventResponse,
  GuestListNameSchema,
  GuestListSchema,
  Promoter,
  OrganizationSchema,
  TicketSoldCounts,
} from "@/types/types";
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
  GetEventWithGuestListsResponse,
  UpdateGuestAttendanceResponse,
  GetEventsByMonthResponse,
  GetEventWithTicketsData,
} from "@/types/convex-types";
import { TIME_ZONE } from "@/types/constants";
import {
  EventSchema,
  GuestListInfoSchema,
  PromoterPromoCodeSchema,
  TicketInfoSchema,
  UserSchema,
  EventWithTicketInfo,
} from "@/types/schemas-types";
import { getCurrentTime } from "../utils/luxon";
import { internal } from "./_generated/api";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateEvent,
  validateGuestList,
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
  isUserInCompanyOfEvent,
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
    ticketData: v.union(
      v.object({
        maleTicketPrice: v.number(),
        femaleTicketPrice: v.number(),
        maleTicketCapacity: v.number(),
        femaleTicketCapacity: v.number(),
        ticketSalesEndTime: v.number(),
      }),
      v.null()
    ),
    guestListData: v.union(
      v.object({
        guestListCloseTime: v.number(),
        checkInCloseTime: v.number(),
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
    let ticketInfoId: Id<"ticketInfo"> | null = null;
    let guestListInfoId: Id<"guestListInfo"> | null = null;
    let stripeProductId: string | null = null;

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

      if (ticketData) {
        ticketInfoId = await handleTicketData(
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
          guestListData
        );
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: { eventId, ticketInfoId, guestListInfoId },
      };
    } catch (error) {
      await performAddEventCleanup(ctx, eventId, ticketInfoId, stripeProductId);

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

      const event: EventSchema | null = await ctx.db.get(normalizedId);
      if (!event) {
        throw new Error(ErrorMessages.EVENT_NOT_FOUND);
      }
      let ticketInfo: TicketInfoSchema | null = null;
      let ticketSoldCounts: TicketSoldCounts | null = null;

      if (event.ticketInfoId) {
        ticketInfo = await ctx.db
          .query("ticketInfo")
          .filter((q) => q.eq(q.field("eventId"), event._id))
          .first();

        ticketSoldCounts = await getTicketSoldCounts(ctx, event._id);
      }

      let guestListInfo: GuestListInfoSchema | null = null;
      if (event.guestListInfoId) {
        guestListInfo = await ctx.db
          .query("guestListInfo")
          .filter((q) => q.eq(q.field("eventId"), event._id))
          .first();
      }
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.SUCCESS,
          data: {
            event,
            ticketInfo,
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
          ticketInfo,
          guestListInfo,
          ticketSoldCounts,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getEventWithGuestLists = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args): Promise<GetEventWithGuestListsResponse> => {
    const { eventId } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Moderator,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
        UserRole.Admin,
        UserRole.Manager,
      ]);

      const clerkUserId = identity.id as string;

      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
        .first();

      const validatedUser = validateUser(user);

      const event: EventSchema | null = await ctx.db.get(args.eventId);
      const validatedEvent = validateEvent(event);
      console.log("validatedEvent", validatedEvent);
      isUserInCompanyOfEvent(validatedUser, validatedEvent);

      const guestLists: GuestListSchema[] = await ctx.db
        .query("guestLists")
        .filter((q) => q.eq(q.field("eventId"), eventId))
        .collect();

      const promoterIds: Id<"users">[] = Array.from(
        new Set(guestLists.map((gl) => gl.userPromoterId))
      );
      const promoters: Promoter[] = await Promise.all(
        promoterIds.map(async (promoterId) => {
          const user = await ctx.db.get(promoterId);
          return { promoterUserId: promoterId, name: user?.name || "Unknown" };
        })
      );
      const promoterMap: Map<string, string> = new Map(
        promoters.map((p) => [p.promoterUserId, p.name])
      );

      const allGuests: AllGuestSchema[] = guestLists.flatMap((guestList) =>
        guestList.names.map((guest) => ({
          ...guest,
          promoterId: guestList.userPromoterId,
          promoterName: promoterMap.get(guestList.userPromoterId) || "Unknown",
          guestListId: guestList._id,
        }))
      );

      const totalMales: number = allGuests.reduce(
        (sum, guest) => sum + (guest.malesInGroup || 0),
        0
      );
      const totalFemales: number = allGuests.reduce(
        (sum, guest) => sum + (guest.femalesInGroup || 0),
        0
      );

      const sortedGuests: AllGuestSchema[] = allGuests.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      console.log("sortedGuests", sortedGuests);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          event: validatedEvent,
          guests: sortedGuests,
          totalMales,
          totalFemales,
        },
      };
    } catch (error) {
      return handleError(error);
    }
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
  handler: async (ctx, args): Promise<UpdateGuestAttendanceResponse> => {
    const { guestListId, guestId, attended, malesInGroup, femalesInGroup } =
      args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Moderator,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.id as string;

      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
        .unique();

      const validatedUser = validateUser(user);

      const guestList: GuestListSchema | null = await ctx.db.get(guestListId);
      const validatedGuestList = validateGuestList(guestList);

      const event: EventSchema | null = await ctx.db.get(
        validatedGuestList.eventId
      );
      const validatedEvent = validateEvent(event);

      isUserInCompanyOfEvent(validatedUser, validatedEvent);

      const updatedNames: GuestListNameSchema[] = validatedGuestList.names.map(
        (guest) => {
          if (guest.id === guestId) {
            return {
              ...guest,
              attended,
              malesInGroup,
              femalesInGroup,
              checkInTime:
                guest.checkInTime || (attended ? getCurrentTime() : undefined),
            };
          }
          return guest;
        }
      );
      await ctx.db.patch(guestListId, {
        names: updatedNames,
      });
      const updatedGuest: GuestListNameSchema | undefined = updatedNames.find(
        (g) => g.id === guestId
      );
      if (!updatedGuest) {
        // Handle the case where the guest was not found
        console.error(`Guest with ID ${guestId} not found.`);
        throw new Error(ErrorMessages.GUEST_NOT_FOUND);
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: { guestListName: updatedGuest },
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
    ticketData: v.union(
      v.object({
        maleTicketPrice: v.number(),
        femaleTicketPrice: v.number(),
        maleTicketCapacity: v.number(),
        femaleTicketCapacity: v.number(),
        ticketSalesEndTime: v.number(),
      }),
      v.null()
    ),
    guestListData: v.union(
      v.object({
        guestListCloseTime: v.number(),
        checkInCloseTime: v.number(),
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

      const ticketInfoId: Id<"ticketInfo"> | null =
        await handleTicketUpdateData(
          ctx,
          eventId,
          ticketData,
          validatedOrganization
        );
      const guestListInfoId: Id<"guestListInfo"> | null =
        await handleGuestListUpdateData(
          ctx,
          validatedOrganization,
          eventId,
          guestListData
        );

      await ctx.runMutation(internal.events.internalUpdateEvent, {
        eventId,
        name,
        description,
        startTime,
        endTime,
        photo,
        address,
        ticketInfoId: ticketData ? ticketInfoId : null,
        guestListInfoId: guestListData ? guestListInfoId : null,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          eventId,
          ticketInfoId,
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

export const getEventsByOrganizationPublic = query({
  args: {
    organizationId: v.id("organizations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (
    ctx,
    args
  ): Promise<PaginationResult<EventWithTicketInfo>> => {
    const organization = await ctx.db.get(args.organizationId);

    if (!organization) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    const currenTime = getCurrentTime();

    const { page, continueCursor, isDone } = await ctx.db
      .query("events")
      .withIndex("by_organizationId_and_startTime", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.gt(q.field("endTime"), currenTime))
      .order("asc")
      .paginate(args.paginationOpts);

    const eventsWithTicketInfo = await Promise.all(
      page.map(async (event) => {
        if (!event.ticketInfoId) {
          return { ...event, ticketInfo: null };
        }

        const ticketInfo = await ctx.db.get(event.ticketInfoId);
        return { ...event, ticketInfo };
      })
    );

    return {
      page: eventsWithTicketInfo,
      continueCursor,
      isDone,
    };
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

      const events: EventSchema[] = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("organizationId"), organization._id))
        .filter((q) => q.gte(q.field("startTime"), startDate.toMillis()))
        .filter((q) => q.lte(q.field("startTime"), endDate.toMillis()))
        .collect();

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          eventData: events,
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
    ticketInfoId: v.optional(v.union(v.id("ticketInfo"), v.null())),
    guestListInfoId: v.optional(v.union(v.id("guestListInfo"), v.null())),
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

        const user: UserSchema | null = await ctx.db
          .query("users")
          .withIndex("by_clerkUserId", (q) =>
            q.eq("clerkUserId", promoterPromoCode.promoterUserId)
          )
          .unique();

        if (!user) {
          throw new Error(ErrorMessages.USER_NOT_FOUND);
        }
        if (!user.organizationId) {
          throw new Error(ErrorMessages.USER_NO_COMPANY);
        }
        if (!user.isActive) {
          throw new Error(ErrorMessages.USER_INACTIVE);
        }
        if (!user.clerkUserId) {
          throw new Error(ErrorMessages.USER_INACTIVE);
        }
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
