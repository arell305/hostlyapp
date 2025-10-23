import { ConvexError, v } from "convex/values";
import {
  isUserInCompanyOfEvent,
  isUserInOrganization,
} from "./backendUtils/helper";
import { mutation, query } from "./_generated/server";
import { GetGuestListKpisData } from "@/shared/types/convex-types";
import { requireAuthenticatedUser } from "@/shared/utils/auth";
import { ShowErrorMessages, UserRole } from "@/shared/types/enums";
import {
  validateEvent,
  validateGuestEntry,
  validateGuestEntryOwnership,
  validateGuestListInfo,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import { Promoter } from "@/shared/types/types";
import { Doc, Id } from "./_generated/dataModel";
import { GuestListEntryWithPromoter } from "@/shared/types/schemas-types";
import { computeKpis, getPercentageChange } from "./backendUtils/kpiHelper";

export const getEventWithGuestLists = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args): Promise<GuestListEntryWithPromoter[]> => {
    const { eventId } = args;

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
      .filter((q) => q.eq(q.field("eventId"), eventId))
      .filter((q) => q.eq(q.field("isActive"), true));

    if (user.role === UserRole.Promoter) {
      guestEntriesQuery = guestEntriesQuery.filter((q) =>
        q.eq(q.field("userPromoterId"), user._id)
      );
    }

    const guestEntries: Doc<"guestListEntries">[] =
      await guestEntriesQuery.collect();

    const promoterIds: Id<"users">[] = Array.from(
      new Set(
        guestEntries
          .map((g) => g.userPromoterId)
          .filter((id): id is Id<"users"> => id !== undefined)
      )
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
        promoterName: entry.userPromoterId
          ? promoterMap.get(entry.userPromoterId) || "Company"
          : "Company",
      })
    );

    const sortedGuests = allGuests.sort((a, b) => a.name.localeCompare(b.name));

    return sortedGuests;
  },
});

export const deleteGuestListEntry = mutation({
  args: {
    guestId: v.id("guestListEntries"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { guestId } = args;

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

    const guestEntry = await ctx.db.get(guestId);
    if (!guestEntry) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ShowErrorMessages.GUEST_NOT_FOUND,
      });
    }

    validateGuestEntryOwnership(guestEntry, user);

    await ctx.db.patch(guestId, {
      isActive: false,
    });

    return true;
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
  handler: async (ctx, args): Promise<boolean> => {
    const { guestId, updates } = args;

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

    return true;
  },
});

export const checkInGuestEntry = mutation({
  args: {
    guestId: v.id("guestListEntries"),
    malesInGroup: v.number(),
    femalesInGroup: v.number(),
    attended: v.boolean(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { guestId, malesInGroup, femalesInGroup, attended } = args;

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

    return true;
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
  handler: async (ctx, args): Promise<boolean> => {
    const { guests, eventId } = args;

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

    return true;
  },
});

export const getGuestListKpis = query({
  args: {
    organizationId: v.id("organizations"),
    fromTimestamp: v.number(),
    toTimestamp: v.number(),
  },
  handler: async (ctx, args): Promise<GetGuestListKpisData> => {
    const { organizationId, fromTimestamp, toTimestamp } = args;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Manager,
      UserRole.Hostly_Admin,
      UserRole.Promoter,
    ]);

    const organization = validateOrganization(await ctx.db.get(organizationId));

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
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const currentEvents = events.filter(
      (event) =>
        event.startTime >= fromTimestamp && event.startTime <= toTimestamp
    );

    const prevFrom = fromTimestamp - (toTimestamp - fromTimestamp);
    const prevTo = fromTimestamp;

    const previousEvents = events.filter(
      (event) => event.startTime >= prevFrom && event.startTime < prevTo
    );

    const currentEventIds = currentEvents.map((e) => e._id);
    const previousEventIds = previousEvents.map((e) => e._id);

    const allEntries = await ctx.db
      .query("guestListEntries")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    let currentEntries = allEntries.filter((entry) =>
      currentEventIds.includes(entry.eventId)
    );

    let previousEntries = allEntries.filter((entry) =>
      previousEventIds.includes(entry.eventId)
    );

    if (identity.role === UserRole.Promoter) {
      currentEntries = currentEntries.filter(
        (entry) => entry.userPromoterId === user._id
      );
      previousEntries = previousEntries.filter(
        (entry) => entry.userPromoterId === user._id
      );
    }

    const currentPromoterSet = new Set(
      currentEntries.map((e) => e.userPromoterId?.toString() ?? "company")
    );

    const previousPromoterSet = new Set(
      previousEntries.map((e) => e.userPromoterId?.toString() ?? "company")
    );

    const currentKpis = computeKpis(
      currentEntries,
      identity.role === UserRole.Promoter
        ? new Set(currentEntries.map((e) => e.eventId.toString())).size
        : currentEvents.length,
      currentPromoterSet
    );

    const previousKpis = computeKpis(
      previousEntries,
      identity.role === UserRole.Promoter
        ? new Set(previousEntries.map((e) => e.eventId.toString())).size
        : previousEvents.length,
      previousPromoterSet
    );

    const eventCheckInData = currentEvents.map((event) => {
      const entries = currentEntries.filter((e) => e.eventId === event._id);
      return {
        name: event.name,
        male: entries.reduce(
          (sum, e) => sum + (e.attended ? e.malesInGroup || 0 : 0),
          0
        ),
        female: entries.reduce(
          (sum, e) => sum + (e.attended ? e.femalesInGroup || 0 : 0),
          0
        ),
      };
    });

    const uniquePromoterIds = Array.from(
      new Set(
        currentEntries.map((e) => e.userPromoterId?.toString() ?? "company")
      )
    );

    const promoterLeaderboard = await Promise.all(
      uniquePromoterIds.map(async (promoterIdStr) => {
        if (promoterIdStr === "company") {
          const entries = currentEntries.filter(
            (e) => !e.userPromoterId && e.attended
          );

          const male = entries.reduce(
            (sum, e) => sum + (e.malesInGroup || 0),
            0
          );
          const female = entries.reduce(
            (sum, e) => sum + (e.femalesInGroup || 0),
            0
          );

          return {
            name: "Company",
            male,
            female,
          };
        } else {
          const promoterId = promoterIdStr as Id<"users">;
          const promoter = await ctx.db.get(promoterId);
          const entries = currentEntries.filter(
            (e) => e.userPromoterId === promoterId && e.attended
          );

          const male = entries.reduce(
            (sum, e) => sum + (e.malesInGroup || 0),
            0
          );
          const female = entries.reduce(
            (sum, e) => sum + (e.femalesInGroup || 0),
            0
          );

          return {
            name: promoter?.name || "Unknown",
            male,
            female,
          };
        }
      })
    );

    promoterLeaderboard.sort((a, b) => a.name.localeCompare(b.name));

    return {
      avgRsvpPerEvent: {
        value: currentKpis.avgRsvpPerEvent,
        change: getPercentageChange(
          currentKpis.avgRsvpPerEvent,
          previousKpis.avgRsvpPerEvent
        ),
      },
      avgCheckinsPerEvent: {
        value: currentKpis.avgCheckinsPerEvent,
        change: getPercentageChange(
          currentKpis.avgCheckinsPerEvent,
          previousKpis.avgCheckinsPerEvent
        ),
      },
      avgCheckinRate: {
        value: currentKpis.avgCheckinRate,
        change: getPercentageChange(
          currentKpis.avgCheckinRate,
          previousKpis.avgCheckinRate
        ),
      },
      avgCheckinsPerPromoter: {
        value: currentKpis.avgCheckinsPerPromoter,
        change: getPercentageChange(
          currentKpis.avgCheckinsPerPromoter,
          previousKpis.avgCheckinsPerPromoter
        ),
      },
      eventCheckInData,
      promoterLeaderboard,
    };
  },
});

export const addPublicGuestListEntry = mutation({
  args: {
    name: v.string(),
    phoneNumber: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { name, phoneNumber, eventId } = args;

    validateEvent(await ctx.db.get(eventId));
    const guestListInfo = validateGuestListInfo(
      await ctx.db
        .query("guestListInfo")
        .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
        .first()
    );

    const isGuestListOpen = guestListInfo.guestListCloseTime > Date.now();
    if (!isGuestListOpen) {
      throw new ConvexError({
        code: "CONFLICT",
        message: ShowErrorMessages.GUEST_LIST_CLOSED,
      });
    }

    await ctx.db.insert("guestListEntries", {
      name,
      phoneNumber,
      eventId,
      isActive: true,
    });

    return true;
  },
});
