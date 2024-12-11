import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Venue } from "./schema";
import {
  AllGuestSchema,
  EventSchema,
  GetEventByIdResponse,
  GetEventWithGuestListsResponse,
  GuestListNameSchema,
  GuestListSchema,
  Promoters,
  UpdateGuestAttendanceResponse,
} from "@/types";
import { ResponseStatus, UserRole } from "../utils/enum";
import { ErrorMessages } from "@/utils/enums";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export const getEventsByOrgAndDate = query({
  args: {
    clerkOrganizationId: v.string(),
    startTime: v.string(),
    endTime: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .filter((q) =>
        q.and(
          q.eq(q.field("clerkOrganizationId"), args.clerkOrganizationId),
          q.gte(q.field("startTime"), args.startTime),
          q.lt(q.field("startTime"), args.endTime)
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
    description: v.union(v.string(), v.null()),
    startTime: v.string(),
    endTime: v.string(),
    photo: v.union(v.id("_storage"), v.null()),
    venue: v.optional(Venue),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      clerkOrganizationId: args.clerkOrganizationId,
      name: args.name,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      photo: args.photo,
      venue: args.venue,
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
  args: { eventId: v.string() },
  handler: async (ctx, { eventId }): Promise<GetEventByIdResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const normalizedId = ctx.db.normalizeId("events", eventId);
      if (!normalizedId) {
        return {
          status: ResponseStatus.NOT_FOUND,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const event = await ctx.db.get(normalizedId);
      if (!event) {
        return {
          status: ResponseStatus.NOT_FOUND,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      // if (identity.clerk_org_id !== event.clerkOrganizationId) {
      //   return {
      //     status: ResponseStatus.UNAUTHORIZED,
      //     data: null,
      //     error: ErrorMessages.FORBIDDEN,
      //   };
      // }

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

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          event,
          ticketInfo,
          guestListInfo,
        },
        error: null,
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
          status: ResponseStatus.UNAUTHENTICATED,
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
          status: ResponseStatus.NOT_FOUND,
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
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const role: UserRole = identity.role as UserRole;
      if (role !== UserRole.Moderator) {
        return {
          status: ResponseStatus.UNAUTHORIZED,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const guestList: GuestListSchema | null = await ctx.db.get(guestListId);
      if (!guestList) {
        return {
          status: ResponseStatus.NOT_FOUND,
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
          status: ResponseStatus.NOT_FOUND,
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
    id: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    startTime: v.optional(v.union(v.string(), v.null())),
    endTime: v.optional(v.union(v.string(), v.null())),
    photo: v.optional(v.union(v.string(), v.null())),
    ticketInfoId: v.optional(v.union(v.id("ticketInfo"), v.null())),
    guestListInfoId: v.optional(v.union(v.id("guestListInfo"), v.null())),
    venue: v.optional(Venue),
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

export const cancelEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const { eventId } = args;

    // Fetch the event to check if it has associated ticket info
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // If the event has a ticketInfoId, delete the ticket info first
    if (event.ticketInfoId) {
      await ctx.db.delete(event.ticketInfoId);
    }

    // Delete the event
    await ctx.db.delete(eventId);

    // Optionally, you might want to delete other related data here
    // For example, guest lists, promo code usage, etc.

    return {
      success: true,
      message: "Event and associated data deleted successfully",
    };
  },
});

// In your Convex queries file
export const getEventsByOrgAndMonth = query({
  args: {
    clerkOrganizationId: v.string(),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const { clerkOrganizationId, year, month } = args;
    const startDate = new Date(year, month - 2, 1);
    const endDate = new Date(year, month + 1, 0);
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("clerkOrganizationId"), clerkOrganizationId))
      .filter((q) => q.gte(q.field("startTime"), startDate.toISOString()))
      .filter((q) => q.lte(q.field("startTime"), endDate.toISOString()))
      .collect();
  },
});
