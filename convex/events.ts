import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import {
  AllGuestSchema,
  CancelEventResponse,
  CustomerSchema,
  EventSchema,
  GetEventWithGuestListsResponse,
  GetEventsByOrgAndMonthResponse,
  GuestListNameSchema,
  GuestListSchema,
  OrganizationsSchema,
  Promoters,
  UpdateEventFields,
  UpdateGuestAttendanceResponse,
} from "@/types/types";
import {
  ResponseStatus,
  SubscriptionStatus,
  SubscriptionTier,
  UserRole,
} from "../utils/enum";
import { ErrorMessages } from "@/types/enums";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { Id } from "./_generated/dataModel";
import { PaginationResult, paginationOptsValidator } from "convex/server";
import {
  AddEventResponse,
  CountGuestListsEventsResponse,
  GetEventByIdResponse,
  GetEventsByOrganizationResponse,
  UpdateEventResponse,
} from "@/types/convex-types";
import { checkIsHostlyAdmin } from "../utils/helpers";
import moment from "moment";
import { PLUS_GUEST_LIST_LIMIT } from "@/types/constants";

// export const getEventsByOrgAndDate = query({
//   args: {
//     clerkOrganizationId: v.string(),
//     startTime: v.string(),
//     endTime: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const events: EventSchema[] = await ctx.db
//       .query("events")
//       .filter((q) =>
//         q.and(
//           q.eq(q.field("clerkOrganizationId"), args.clerkOrganizationId),
//           q.gte(q.field("startTime"), args.startTime),
//           q.lt(q.field("startTime"), args.endTime)
//         )
//       )
//       .collect();

//     return events || [];
//   },
// });

export const addEvent = mutation({
  args: {
    clerkOrganizationId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    startTime: v.string(),
    endTime: v.string(),
    photo: v.union(v.id("_storage"), v.null()),
    address: v.string(),
    ticketData: v.union(
      v.object({
        maleTicketPrice: v.number(),
        femaleTicketPrice: v.number(),
        maleTicketCapacity: v.number(),
        femaleTicketCapacity: v.number(),
        ticketSalesEndTime: v.string(),
      }),
      v.null()
    ),
    guestListData: v.union(
      v.object({
        guestListCloseTime: v.string(),
        checkInCloseTime: v.string(),
      }),
      v.null()
    ),
  },
  handler: async (ctx, args): Promise<AddEventResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const role: UserRole = identity.role as UserRole;
      if (role !== UserRole.Admin && role !== UserRole.Manager) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      if (args.clerkOrganizationId !== identity.clerk_org_id) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .withIndex("by_clerkOrganizationId", (q) =>
          q.eq("clerkOrganizationId", args.clerkOrganizationId)
        )
        .first();

      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const customer: CustomerSchema | null = await ctx.db
        .query("customers")
        .filter((q) => q.eq(q.field("_id"), organization.customerId))
        .first();

      if (!customer) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      if (
        args.guestListData &&
        customer.subscriptionTier === SubscriptionTier.PLUS
      ) {
        const subscriptionStart = moment(customer.subscriptionStartDate);
        const eventStart = moment(args.startTime);

        let cycleStart = subscriptionStart.clone();
        while (cycleStart.add(1, "months").isBefore(eventStart)) {
          // Intentionally empty; the loop advances cycleStart to the correct month
        }
        const cycleEnd = cycleStart.clone().add(1, "months");

        const events: EventSchema[] = await ctx.db
          .query("events")
          .filter((q) => q.eq(q.field("clerkOrganizationId"), organization._id))
          .filter((q) => q.gte(q.field("startTime"), cycleStart.toISOString()))
          .filter((q) => q.lte(q.field("startTime"), cycleEnd.toISOString()))
          .collect();

        const overLimit = events.length >= PLUS_GUEST_LIST_LIMIT;

        if (overLimit) {
          return {
            status: ResponseStatus.ERROR,
            data: null,
            error: `Guest List Events limit of ${PLUS_GUEST_LIST_LIMIT} reached for pay period ${cycleStart.format("MMM D, YYYY")} to ${cycleEnd.format("MMM D, YYYY")}. Unable to add more guest list events during this period.`,
          };
        }
      }

      const eventId: Id<"events"> = await ctx.db.insert("events", {
        clerkOrganizationId: args.clerkOrganizationId,
        name: args.name,
        description: args.description,
        startTime: args.startTime,
        endTime: args.endTime,
        photo: args.photo,
        address: args.address,
        isActive: true,
      });

      if (args.ticketData) {
        const ticketInfoId: Id<"ticketInfo"> = await ctx.db.insert(
          "ticketInfo",
          {
            eventId: eventId,
            maleTicketPrice: args.ticketData.maleTicketPrice,
            femaleTicketPrice: args.ticketData.femaleTicketPrice,
            maleTicketCapacity: args.ticketData.maleTicketCapacity,
            femaleTicketCapacity: args.ticketData.femaleTicketCapacity,
            ticketSalesEndTime: args.ticketData.ticketSalesEndTime,
          }
        );
        await ctx.db.patch(eventId, {
          ticketInfoId,
        });
      }

      if (args.guestListData) {
        const guestListInfoId: Id<"guestListInfo"> = await ctx.db.insert(
          "guestListInfo",
          {
            eventId: eventId,
            guestListCloseTime: args.guestListData.guestListCloseTime,
            checkInCloseTime: args.guestListData.checkInCloseTime,
            guestListIds: [],
          }
        );
        await ctx.db.patch(eventId, {
          guestListInfoId,
        });
      }

      await ctx.db.patch(organization._id, {
        eventIds: [...organization.eventIds, eventId],
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          eventId,
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

export const getEventById = query({
  args: { eventId: v.string() },
  handler: async (ctx, { eventId }): Promise<GetEventByIdResponse> => {
    const normalizedId = ctx.db.normalizeId("events", eventId);
    if (!normalizedId) {
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: ErrorMessages.NOT_FOUND,
      };
    }
    try {
      const event: EventSchema | null = await ctx.db.get(normalizedId);
      if (!event) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const ticketInfoPromise = event.ticketInfoId
        ? ctx.db.get(event.ticketInfoId)
        : Promise.resolve(null);

      const guestListInfoPromise = event.guestListInfoId
        ? ctx.db.get(event.guestListInfoId)
        : Promise.resolve(null);

      // Use Promise.all to fetch all data concurrently
      const [ticketInfo, guestListInfo] = await Promise.all([
        ticketInfoPromise,
        guestListInfoPromise,
      ]);
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.SUCCESS,
          data: {
            event,
            ticketInfo,
          },
        };
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          event,
          ticketInfo,
          guestListInfo,
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

export const getEventWithGuestLists = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args): Promise<GetEventWithGuestListsResponse> => {
    const { eventId } = args;

    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      // if (identity.clerk_org_id !== eventId) {
      //   return {
      //     status: ResponseStatus.UNAUTHORIZED,
      //     data: null,
      //     error: ErrorMessages.FORBIDDEN,
      //   };
      // }
      const event: EventSchema | null = await ctx.db.get(eventId);
      if (!event) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }
      const guestLists: GuestListSchema[] = await ctx.db
        .query("guestLists")
        .filter((q) => q.eq(q.field("eventId"), eventId))
        .collect();

      const promoterIds: string[] = Array.from(
        new Set(guestLists.map((gl) => gl.clerkPromoterId))
      );
      const promoters: Promoters[] = await Promise.all(
        promoterIds.map(async (promoterId) => {
          const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkUserId"), promoterId))
            .first();
          return { id: promoterId, name: user?.name || "Unknown" };
        })
      );
      const promoterMap: Map<string, string> = new Map(
        promoters.map((p) => [p.id, p.name])
      );

      const allGuests: AllGuestSchema[] = guestLists.flatMap((guestList) =>
        guestList.names.map((guest) => ({
          ...guest,
          promoterId: guestList.clerkPromoterId,
          promoterName: promoterMap.get(guestList.clerkPromoterId) || "Unknown",
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

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          event,
          guests: sortedGuests,
          totalMales,
          totalFemales,
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
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const role: UserRole = identity.role as UserRole;
      if (role !== UserRole.Moderator) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const guestList: GuestListSchema | null = await ctx.db.get(guestListId);
      if (!guestList) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const updatedNames: GuestListNameSchema[] = guestList.names.map(
        (guest) => {
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
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: updatedGuest,
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

export const updateEvent = mutation({
  args: {
    clerkOrganizationId: v.string(),
    eventId: v.id("events"),
    name: v.union(v.string(), v.null()),
    description: v.union(v.string(), v.null()),
    startTime: v.union(v.string(), v.null()),
    endTime: v.union(v.string(), v.null()),
    photo: v.union(v.id("_storage"), v.null()),
    address: v.union(v.string(), v.null()),
    ticketData: v.union(
      v.object({
        maleTicketPrice: v.number(),
        femaleTicketPrice: v.number(),
        maleTicketCapacity: v.number(),
        femaleTicketCapacity: v.number(),
        ticketSalesEndTime: v.string(),
      }),
      v.null()
    ),
    guestListData: v.union(
      v.object({
        guestListCloseTime: v.string(),
        checkInCloseTime: v.string(),
      }),
      v.null()
    ),
  },
  handler: async (ctx, args): Promise<UpdateEventResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const role: UserRole = identity.role as UserRole;
      if (role !== UserRole.Admin && role !== UserRole.Manager) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const event = await ctx.db.get(args.eventId);
      if (!event) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      if (event.clerkOrganizationId !== identity.clerk_org_id) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }
      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .withIndex("by_clerkOrganizationId", (q) =>
          q.eq("clerkOrganizationId", args.clerkOrganizationId)
        )
        .first();

      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const customer: CustomerSchema | null = await ctx.db
        .query("customers")
        .filter((q) => q.eq(q.field("_id"), organization.customerId))
        .first();

      if (!customer) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      if (
        args.guestListData &&
        customer.subscriptionTier === SubscriptionTier.PLUS
      ) {
        const subscriptionStart = moment(customer.subscriptionStartDate);
        const eventStart = moment(args.startTime);

        let cycleStart = subscriptionStart.clone();
        while (cycleStart.add(1, "months").isBefore(eventStart)) {
          // Intentionally empty; the loop advances cycleStart to the correct month
        }
        const cycleEnd = cycleStart.clone().add(1, "months");

        const events: EventSchema[] = await ctx.db
          .query("events")
          .filter((q) => q.eq(q.field("clerkOrganizationId"), organization._id))
          .filter((q) => q.gte(q.field("startTime"), cycleStart.toISOString()))
          .filter((q) => q.lte(q.field("startTime"), cycleEnd.toISOString()))
          .collect();

        const overLimit = events.length >= PLUS_GUEST_LIST_LIMIT;

        if (overLimit) {
          return {
            status: ResponseStatus.ERROR,
            data: null,
            error: `Guest List Events limit of ${PLUS_GUEST_LIST_LIMIT} reached for pay period ${cycleStart.format("MMM D, YYYY")} to ${cycleEnd.format("MMM D, YYYY")}. Unable to add more guest list events during this period.`,
          };
        }
      }

      const updatedEventData: Partial<EventSchema> = {};
      if (args.name) updatedEventData.name = args.name;
      if (args.description !== null)
        updatedEventData.description = args.description;
      if (args.startTime) updatedEventData.startTime = args.startTime;
      if (args.endTime) updatedEventData.endTime = args.endTime;
      if (args.photo) updatedEventData.photo = args.photo;
      if (args.address) updatedEventData.address = args.address;

      if (args.ticketData === null) {
        // Check for an existing ticketInfo record associated with the event
        const existingTicketInfo = event.ticketInfoId
          ? await ctx.db.get(event.ticketInfoId)
          : await ctx.db
              .query("ticketInfo")
              .filter((q) => q.eq(q.field("eventId"), event._id))
              .first();

        if (existingTicketInfo) {
          // If a ticketInfo exists, deactivate it
          updatedEventData.ticketInfoId = null; // Remove ticket association from the event
        }
      } else {
        // Check for an existing ticketInfo record
        const existingTicketInfo = event.ticketInfoId
          ? await ctx.db.get(event.ticketInfoId)
          : await ctx.db
              .query("ticketInfo")
              .filter((q) => q.eq(q.field("eventId"), event._id))
              .first();

        if (existingTicketInfo) {
          // Update the existing ticketInfo record
          await ctx.db.patch(existingTicketInfo._id, {
            ...args.ticketData,
          });
          updatedEventData.ticketInfoId = existingTicketInfo._id;
        } else {
          // Create a new ticketInfo record if none exists
          const ticketInfoId = await ctx.db.insert("ticketInfo", {
            ...args.ticketData,
            eventId: event._id,
          });
          updatedEventData.ticketInfoId = ticketInfoId;
        }
      }

      if (args.guestListData === null) {
        // Check for an existing guestListInfo record associated with the event
        const existingGuestListInfo = event.guestListInfoId
          ? await ctx.db.get(event.guestListInfoId)
          : await ctx.db
              .query("guestListInfo")
              .filter((q) => q.eq(q.field("eventId"), event._id))
              .first();

        if (existingGuestListInfo) {
          // If a guestListInfo exists, deactivate it
          updatedEventData.guestListInfoId = null; // Remove guest list association from the event
        }
      } else {
        // Check for an existing guestListInfo record
        const existingGuestListInfo = event.guestListInfoId
          ? await ctx.db.get(event.guestListInfoId)
          : await ctx.db
              .query("guestListInfo")
              .filter((q) => q.eq(q.field("eventId"), event._id))
              .first();

        if (existingGuestListInfo) {
          // Update the existing guestListInfo record
          await ctx.db.patch(existingGuestListInfo._id, {
            ...args.guestListData,
          });
          updatedEventData.guestListInfoId = existingGuestListInfo._id;
        } else {
          // Create a new guestListInfo record if none exists
          const guestListInfoId = await ctx.db.insert("guestListInfo", {
            ...args.guestListData,
            eventId: event._id,
            guestListIds: [],
          });
          updatedEventData.guestListInfoId = guestListInfoId;
        }
      }

      await ctx.db.patch(event._id, updatedEventData);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          eventId: event._id,
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
export const cancelEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args): Promise<CancelEventResponse> => {
    const { eventId } = args;

    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const role: UserRole = identity.role as UserRole;
      if (role !== UserRole.Admin && role !== UserRole.Manager) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const event: EventSchema | null = await ctx.db.get(eventId);
      if (!event) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      if (event.clerkOrganizationId !== identity.clerk_org_id) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      await ctx.db.patch(eventId, { isActive: false });
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          eventId,
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

// In your Convex queries file
export const getEventsByOrgAndMonth = query({
  args: {
    clerkOrganizationId: v.string(),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args): Promise<GetEventsByOrgAndMonthResponse> => {
    const { clerkOrganizationId, year, month } = args;
    const startDate = new Date(year, month - 2, 1);
    const endDate = new Date(year, month + 1, 0);

    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const events: EventSchema[] = await ctx.db
        .query("events")
        .filter((q) =>
          q.eq(q.field("clerkOrganizationId"), clerkOrganizationId)
        )
        .filter((q) => q.gte(q.field("startTime"), startDate.toISOString()))
        .filter((q) => q.lte(q.field("startTime"), endDate.toISOString()))
        .collect();

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          eventData: events,
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

export const getEventsByOrganizationPublic = query({
  args: {
    organizationName: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentDate = new Date().toISOString();
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_name", (q) => q.eq("name", args.organizationName))
      .first();

    if (!organization) {
      return {
        page: [],
        isDone: true,
        continueCursor: null,
      } as unknown as PaginationResult<EventSchema>;
    }

    const events = await ctx.db
      .query("events")
      .withIndex("by_clerkOrganizationId_and_startTime", (q) =>
        q.eq("clerkOrganizationId", organization.clerkOrganizationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.gt(q.field("endTime"), currentDate)
        )
      )
      .order("asc")
      .paginate(args.paginationOpts);

    return { ...events, organizationImage: organization.imageUrl || null };
  },
});

export const getEventsByNameAndMonth = query({
  args: {
    organizationName: v.string(),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args): Promise<GetEventsByOrgAndMonthResponse> => {
    const { organizationName, year, month } = args;
    const startDate = new Date(year, month - 2, 1);
    const endDate = new Date(year, month + 1, 0);

    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .withIndex("by_name", (q) => q.eq("name", organizationName))
        .first();

      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const isHostlyAdmin = checkIsHostlyAdmin(identity.role as string);

      if (
        organization.clerkOrganizationId !== identity.clerk_org_id &&
        !isHostlyAdmin
      ) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const events: EventSchema[] = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("clerkOrganizationId"), organization._id))
        .filter((q) => q.gte(q.field("startTime"), startDate.toISOString()))
        .filter((q) => q.lte(q.field("startTime"), endDate.toISOString()))
        .collect();

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          eventData: events,
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

export const countGuestListEvents = query({
  args: {
    clerkOrganizationId: v.string(),
    eventStartTime: v.string(),
  },
  handler: async (ctx, args): Promise<CountGuestListsEventsResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const isHostlyAdmin = checkIsHostlyAdmin(identity.role as string);

      if (
        args.clerkOrganizationId !== identity.clerk_org_id &&
        !isHostlyAdmin
      ) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .withIndex("by_clerkOrganizationId", (q) =>
          q.eq("clerkOrganizationId", args.clerkOrganizationId)
        )
        .first();

      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const customer: CustomerSchema | null = await ctx.db
        .query("customers")
        .filter((q) => q.eq(q.field("_id"), organization.customerId))
        .first();

      if (!customer) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }
      const subscriptionStart = moment(customer.subscriptionStartDate);
      const eventStart = moment(args.eventStartTime);

      let cycleStart = subscriptionStart.clone();
      while (cycleStart.add(1, "months").isBefore(eventStart)) {
        // Intentionally empty; the loop advances cycleStart to the correct month
      }
      const cycleEnd = cycleStart.clone().add(1, "months");

      const events: EventSchema[] = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("clerkOrganizationId"), organization._id))
        .filter((q) => q.gte(q.field("startTime"), cycleStart.toISOString()))
        .filter((q) => q.lte(q.field("startTime"), cycleEnd.toISOString()))
        .collect();

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          countData: {
            eventsCount: events.length,
            cycleStart: cycleStart.toISOString(),
            cycleEnd: cycleEnd.toISOString(),
          },
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
