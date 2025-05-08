import { v } from "convex/values";
import {
  handleError,
  isUserInCompanyOfEvent,
  isUserInOrganization,
} from "./backendUtils/helper";
import { mutation, query } from "./_generated/server";
import {
  AddGuestListEntryResponse,
  CheckInData,
  CheckInGuestEntryResponse,
  DeleteGuestListEntryResponse,
  GetEventWithGuestListsResponse,
  GetGuestListKpisResponse,
  GetGuestsGroupedByPromoterResponse,
  GetPromoterGuestStatsResponse,
  PromoterGuestStatsData,
  UpdateGuestListEntryResponse,
} from "@/types/convex-types";
import { requireAuthenticatedUser } from "@/utils/auth";
import { ResponseStatus, ShowErrorMessages, UserRole } from "@/types/enums";
import {
  validateEvent,
  validateGuestEntry,
  validateGuestEntryOwnership,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import { Promoter } from "@/types/types";
import { Id } from "./_generated/dataModel";
import {
  GuestListEntrySchema,
  GuestListEntryWithPromoter,
} from "@/types/schemas-types";

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
        UserRole.Promoter,
      ]);

      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .first()
      );

      const event = validateEvent(await ctx.db.get(eventId));
      isUserInCompanyOfEvent(user, event);

      let guestEntriesQuery = ctx.db
        .query("guestListEntries")
        .filter((q) => q.eq(q.field("eventId"), eventId));

      if (user.role === UserRole.Promoter) {
        guestEntriesQuery = guestEntriesQuery.filter((q) =>
          q.eq(q.field("userPromoterId"), user._id)
        );
      }

      const guestEntries: GuestListEntrySchema[] =
        await guestEntriesQuery.collect();

      const promoterIds: Id<"users">[] = Array.from(
        new Set(guestEntries.map((g) => g.userPromoterId))
      );

      const promoters: Promoter[] = await Promise.all(
        promoterIds.map(async (promoterId) => {
          const promoterUser = await ctx.db.get(promoterId);
          return {
            promoterUserId: promoterId,
            name: promoterUser?.name || "Unknown",
          };
        })
      );

      const promoterMap = new Map(
        promoters.map((p) => [p.promoterUserId, p.name])
      );

      const allGuests: GuestListEntryWithPromoter[] = guestEntries.map(
        (entry) => ({
          ...entry,
          promoterName: promoterMap.get(entry.userPromoterId) || "Unknown",
        })
      );

      const sortedGuests = allGuests.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guests: sortedGuests,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const deleteGuestListEntry = mutation({
  args: {
    guestId: v.id("guestListEntries"),
  },
  handler: async (ctx, args): Promise<DeleteGuestListEntryResponse> => {
    const { guestId } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Promoter,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      if (identity.role !== UserRole.Promoter) {
        throw new Error(ShowErrorMessages.FORBIDDEN_PRIVILEGES);
      }

      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .unique()
      );

      const guestEntry = await ctx.db.get(guestId);
      if (!guestEntry) {
        throw new Error(ShowErrorMessages.GUEST_NOT_FOUND);
      }

      validateGuestEntryOwnership(guestEntry, user);

      await ctx.db.patch(guestId, {
        isActive: false,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListEntryId: guestId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const updateGuestListEntry = mutation({
  args: {
    guestId: v.id("guestListEntries"),
    updates: v.object({
      name: v.string(),
      phoneNumber: v.optional(v.union(v.string(), v.null())),
    }),
  },
  handler: async (ctx, args): Promise<UpdateGuestListEntryResponse> => {
    const { guestId, updates } = args;

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

      const guestEntry = validateGuestEntry(await ctx.db.get(guestId));

      validateGuestEntryOwnership(guestEntry, user);

      await ctx.db.patch(guestId, updates);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListEntryId: guestId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const checkInGuestEntry = mutation({
  args: {
    guestId: v.id("guestListEntries"),
    malesInGroup: v.number(),
    femalesInGroup: v.number(),
    attended: v.boolean(),
  },
  handler: async (ctx, args): Promise<CheckInGuestEntryResponse> => {
    const { guestId, malesInGroup, femalesInGroup, attended } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Hostly_Admin,
        UserRole.Hostly_Moderator,
        UserRole.Moderator,
      ]);

      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .unique()
      );

      const guestEntry = validateGuestEntry(await ctx.db.get(guestId));

      const event = validateEvent(await ctx.db.get(guestEntry.eventId));
      isUserInCompanyOfEvent(user, event);

      await ctx.db.patch(guestId, {
        attended,
        checkInTime: Date.now(),
        malesInGroup,
        femalesInGroup,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListEntryId: guestId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const addGuestListEntry = mutation({
  args: {
    guests: v.array(
      v.object({
        name: v.string(),
        phoneNumber: v.optional(v.string()),
      })
    ),
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<AddGuestListEntryResponse> => {
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

      const insertedGuestIds: Id<"guestListEntries">[] = [];

      for (const guest of guests) {
        const guestId = await ctx.db.insert("guestListEntries", {
          name: guest.name,
          phoneNumber: guest.phoneNumber,
          eventId,
          userPromoterId: user._id,
          isActive: true,
        });

        insertedGuestIds.push(guestId);
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestEntryIds: insertedGuestIds,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getGuestsGroupedByPromoter = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<GetGuestsGroupedByPromoterResponse> => {
    const { eventId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Hostly_Admin,
        UserRole.Hostly_Moderator,
        UserRole.Moderator,
        UserRole.Manager,
        UserRole.Admin,
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

      const guestEntries = await ctx.db
        .query("guestListEntries")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      const promoterIds: Id<"users">[] = Array.from(
        new Set(guestEntries.map((g) => g.userPromoterId))
      );

      const promoters = await Promise.all(
        promoterIds.map(async (promoterId) => {
          const promoterUser = await ctx.db.get(promoterId);
          return {
            promoterUserId: promoterId,
            name: promoterUser?.name || "Unknown",
          };
        })
      );

      const promoterMap = new Map(
        promoters.map((p) => [p.promoterUserId, p.name])
      );

      const grouped = new Map<
        Id<"users">,
        {
          promoterId: Id<"users">;
          promoterName: string;
          guests: typeof guestEntries;
          totalMales: number;
          totalFemales: number;
        }
      >();

      // Overall totals
      let totalMales = 0;
      let totalFemales = 0;
      let totalGuests = 0;
      let totalCheckedIn = 0;

      for (const guest of guestEntries) {
        const promoterId = guest.userPromoterId;
        const promoterName = promoterMap.get(promoterId) || "Unknown";

        if (!grouped.has(promoterId)) {
          grouped.set(promoterId, {
            promoterId,
            promoterName,
            guests: [],
            totalMales: 0,
            totalFemales: 0,
          });
        }

        const group = grouped.get(promoterId)!;
        group.guests.push(guest);

        const males = guest.malesInGroup || 0;
        const females = guest.femalesInGroup || 0;

        group.totalMales += males;
        group.totalFemales += females;

        totalMales += males;
        totalFemales += females;
        totalGuests += 1;
        if (guest.attended) {
          totalCheckedIn += 1;
        }
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guests: Array.from(grouped.values()),
          totalMales,
          totalFemales,
          totalGuests,
          totalCheckedIn,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getPromoterGuestStats = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<GetPromoterGuestStatsResponse> => {
    const { eventId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Hostly_Admin,
        UserRole.Hostly_Moderator,
        UserRole.Moderator,
        UserRole.Manager,
        UserRole.Promoter,
      ]);

      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .first()
      );

      const event = validateEvent(await ctx.db.get(eventId));
      isUserInCompanyOfEvent(user, event);

      if (!event.guestListInfoId) {
        return {
          status: ResponseStatus.SUCCESS,
          data: { promoterGuestStats: [] },
        };
      }

      const isManager = [
        UserRole.Admin,
        UserRole.Hostly_Admin,
        UserRole.Hostly_Moderator,
        UserRole.Moderator,
        UserRole.Manager,
      ].includes(user.role as UserRole);

      const allEntries = await ctx.db
        .query("guestListEntries")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      const entriesToUse = isManager
        ? allEntries
        : allEntries.filter((e) => e.userPromoterId === user._id);

      const grouped = new Map<
        Id<"users">,
        Omit<PromoterGuestStatsData, "entries">
      >();

      let totalMales = 0;
      let totalFemales = 0;
      let totalRSVPs = 0;
      let totalCheckedIn = 0;

      for (const entry of entriesToUse) {
        const promoterId = entry.userPromoterId;

        const existing = grouped.get(promoterId) ?? {
          promoterId,
          promoterName: "",
          totalMales: 0,
          totalFemales: 0,
          totalRSVPs: 0,
          totalCheckedIn: 0,
        };

        const males = entry.malesInGroup ?? 0;
        const females = entry.femalesInGroup ?? 0;

        existing.totalMales += males;
        existing.totalFemales += females;
        existing.totalRSVPs += 1;
        existing.totalCheckedIn += entry.attended ? 1 : 0;

        grouped.set(promoterId, existing);

        if (isManager) {
          totalMales += males;
          totalFemales += females;
          totalRSVPs += 1;
          totalCheckedIn += entry.attended ? 1 : 0;
        }
      }

      const promoterIds = Array.from(grouped.keys());
      const users = await Promise.all(promoterIds.map((id) => ctx.db.get(id)));

      users.forEach((u) => {
        if (!u) return;
        const summary = grouped.get(u._id);
        if (summary) summary.promoterName = u.name ?? "";
      });

      const sortedStats = Array.from(grouped.values()).sort(
        (a, b) => b.totalCheckedIn - a.totalCheckedIn
      );

      const data: {
        promoterGuestStats: Omit<PromoterGuestStatsData, "entries">[];
        checkInData?: CheckInData;
      } = {
        promoterGuestStats: sortedStats,
      };

      if (isManager) {
        data.checkInData = {
          totalCheckedIn,
          totalMales,
          totalFemales,
          totalRSVPs,
        };
      }
      console.log("data", data);

      return {
        status: ResponseStatus.SUCCESS,
        data,
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

      let guestListEntries = await ctx.db
        .query("guestListEntries")
        .filter((q) =>
          q.or(...eventIds.map((id) => q.eq(q.field("eventId"), id)))
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      if (identity.role === UserRole.Promoter) {
        guestListEntries = guestListEntries.filter(
          (entry) => entry.userPromoterId.toString() === user._id
        );
      }

      let totalRsvps = guestListEntries.length;
      let totalCheckins = guestListEntries.filter((e) => e.attended).length;

      const promoterSet = new Set(
        guestListEntries.map((e) => e.userPromoterId.toString())
      );

      const relevantEventCount =
        identity.role === UserRole.Promoter
          ? new Set(guestListEntries.map((e) => e.eventId.toString())).size
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
