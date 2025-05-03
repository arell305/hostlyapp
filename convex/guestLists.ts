import { ShowErrorMessages, UserRole, ResponseStatus } from "@/types/enums";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";
import {
  DeleteGuestNameResponse,
  GuestListNameSchema,
  GuestListSchema,
} from "@/types/types";
import { Id } from "./_generated/dataModel";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateEvent,
  validateGuestList,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import {
  handleError,
  isUserInCompanyOfEvent,
  isUserInOrganization,
  isUserThePromoter,
} from "./backendUtils/helper";
import {
  GetGuestListByPromoterResponse,
  UpdateGuestNameResponse,
  AddGuestListResponse,
  GetGuestListKpisResponse,
} from "@/types/convex-types";

export const addGuestList = mutation({
  args: {
    guests: v.array(
      v.object({
        name: v.string(),
        phoneNumber: v.optional(v.string()),
      })
    ),
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<AddGuestListResponse> => {
    const { guests, eventId } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Promoter,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .unique()
      );

      const event = validateEvent(await ctx.db.get(eventId));
      isUserInCompanyOfEvent(user, event);

      const newGuestObjects = guests.map((guest) => ({
        id: `guest_${nanoid()}`,
        name: guest.name,
        phoneNumber: guest.phoneNumber,
      }));

      const existingGuestList: GuestListSchema | null = await ctx.db
        .query("guestLists")
        .filter((q) =>
          q.and(
            q.eq(q.field("userPromoterId"), user._id),
            q.eq(q.field("eventId"), eventId)
          )
        )
        .first();

      if (existingGuestList) {
        const updatedNames = [...existingGuestList.names, ...newGuestObjects];
        await ctx.db.patch(existingGuestList._id, {
          names: updatedNames,
        });

        return {
          status: ResponseStatus.SUCCESS,
          data: {
            guestListId: existingGuestList._id,
            names: updatedNames,
          },
        };
      }

      const newGuestListId = await ctx.db.insert("guestLists", {
        names: newGuestObjects,
        userPromoterId: user._id,
        eventId,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListId: newGuestListId,
          names: newGuestObjects,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getGuestListByPromoter = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<GetGuestListByPromoterResponse> => {
    const { eventId } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Promoter,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.id as string;
      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .unique()
      );

      const guestList = await ctx.db
        .query("guestLists")
        .filter((q) =>
          q.and(
            q.eq(q.field("userPromoterId"), user._id),
            q.eq(q.field("eventId"), eventId)
          )
        )
        .first();

      if (!guestList) {
        return {
          status: ResponseStatus.SUCCESS,
          data: {
            guestListId: null,
            names: [],
            totalCheckedIn: 0,
            totalGuests: 0,
            totalMalesCheckedIn: 0,
            totalFemalesCheckedIn: 0,
          },
        };
      }

      const names = guestList.names;

      const totalCheckedIn = names.filter((g) => g.attended).length;
      const totalGuests = names.length;

      const totalMalesCheckedIn = names.reduce((sum, g) => {
        return sum + (g.attended && g.malesInGroup ? g.malesInGroup : 0);
      }, 0);

      const totalFemalesCheckedIn = names.reduce((sum, g) => {
        return sum + (g.attended && g.femalesInGroup ? g.femalesInGroup : 0);
      }, 0);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListId: guestList._id,
          names,
          totalCheckedIn,
          totalGuests,
          totalMalesCheckedIn,
          totalFemalesCheckedIn,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const updateGuestName = mutation({
  args: {
    guestListId: v.id("guestLists"),
    guestId: v.string(),
    newName: v.string(),
  },
  handler: async (ctx, args): Promise<UpdateGuestNameResponse> => {
    const { guestListId, guestId, newName } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Promoter,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.user as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .unique()
      );

      const guestList = validateGuestList(await ctx.db.get(guestListId));

      isUserThePromoter(guestList, user);

      const updatedNames: GuestListNameSchema[] = guestList.names.map(
        (guest) => {
          if (guest.id === guestId) {
            return { ...guest, name: newName };
          }
          return guest;
        }
      );

      await ctx.db.patch(guestListId, {
        names: updatedNames,
      });

      const updatedGuest: GuestListNameSchema | undefined = updatedNames.find(
        (guest) => guest.id === guestId
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListId,
          updatedGuest: updatedGuest,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const deleteGuestName = mutation({
  args: {
    guestListId: v.id("guestLists"),
    guestId: v.string(),
  },
  handler: async (ctx, args): Promise<DeleteGuestNameResponse> => {
    const { guestListId, guestId } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Promoter,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      if (identity.role !== UserRole.Promoter) {
        throw new Error(ShowErrorMessages.FORBIDDEN_PRIVILEGES);
      }

      const clerkUserId = identity.user as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .unique()
      );

      const guestList = validateGuestList(await ctx.db.get(guestListId));

      isUserThePromoter(guestList, user);

      const updatedNames: GuestListNameSchema[] = guestList.names.filter(
        (guest) => guest.id !== guestId
      );
      if (updatedNames.length === guestList.names.length) {
        throw new Error(ShowErrorMessages.GUEST_NOT_FOUND);
      }
      await ctx.db.patch(guestListId, {
        names: updatedNames,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListId,
          deletedGuestId: guestId,
          remainingGuestsCount: updatedNames.length,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getGuestListKpis = query({
  args: {
    organizationId: v.id("organizations"),
    fromTimestamp: v.number(),
    toTimestamp: v.number(),
  },
  handler: async (ctx, args): Promise<GetGuestListKpisResponse> => {
    const { organizationId, fromTimestamp, toTimestamp } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Admin,
        UserRole.Promoter,
      ]);

      const organization = validateOrganization(
        await ctx.db.get(organizationId)
      );

      isUserInOrganization(identity, organization.clerkOrganizationId);

      const user = validateUser(
        await ctx.db
          .query("users")
          .withIndex("by_clerkUserId", (q) =>
            q.eq("clerkUserId", identity.id as string)
          )
          .unique()
      );

      const events = await ctx.db
        .query("events")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", organizationId)
        )
        .collect();

      const filteredEvents = events.filter(
        (event) =>
          event.startTime >= fromTimestamp && event.startTime <= toTimestamp
      );

      const eventIds = filteredEvents.map((e) => e._id);

      const guestListsArrays = await Promise.all(
        eventIds.map((eventId) =>
          ctx.db
            .query("guestLists")
            .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
            .collect()
        )
      );

      // Flatten and filter if promoter
      let guestLists = guestListsArrays.flat();

      if (identity.role === UserRole.Promoter) {
        guestLists = guestLists.filter(
          (gl) => gl.userPromoterId.toString() === user._id
        );
      }

      let totalRsvps = 0;
      let totalCheckins = 0;
      const promoterSet = new Set();

      for (const gl of guestLists) {
        totalRsvps += gl.names.length;
        totalCheckins += gl.names.filter((n) => n.attended).length;
        promoterSet.add(gl.userPromoterId.toString());
      }

      const relevantEventCount =
        identity.role === UserRole.Promoter
          ? new Set(guestLists.map((gl) => gl.eventId.toString())).size
          : filteredEvents.length;

      const avgRsvpPerEvent = relevantEventCount
        ? totalRsvps / relevantEventCount
        : 0;
      const avgCheckinsPerEvent = relevantEventCount
        ? totalCheckins / relevantEventCount
        : 0;
      const avgCheckinRate = totalRsvps ? totalCheckins / totalRsvps : 0;
      const avgCheckinsPerPromoter = promoterSet.size
        ? totalCheckins / promoterSet.size
        : 0;

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          avgRsvpPerEvent,
          avgCheckinsPerEvent,
          avgCheckinRate,
          avgCheckinsPerPromoter,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
