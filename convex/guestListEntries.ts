import { v } from "convex/values";
import {
  handleError,
  isUserInCompanyOfEvent,
  isUserInOrganization,
} from "./backendUtils/helper";
import { mutation, query } from "./_generated/server";
import {
  AddGuestListEntryResponse,
  AddPublicGuestListEntryResponse,
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
  validateGuestListInfo,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import { Promoter } from "@/types/types";
import { Id } from "./_generated/dataModel";
import {
  GuestListEntrySchema,
  GuestListEntryWithPromoter,
  GuestListInfoSchema,
  UserSchema,
} from "@/types/schemas-types";
import { computeKpis, getPercentageChange } from "./backendUtils/kpiHelper";

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
        .filter((q) => q.eq(q.field("eventId"), eventId))
        .filter((q) => q.eq(q.field("isActive"), true));

      if (user.role === UserRole.Promoter) {
        guestEntriesQuery = guestEntriesQuery.filter((q) =>
          q.eq(q.field("userPromoterId"), user._id)
        );
      }

      const guestEntries: GuestListEntrySchema[] =
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
        new Set(
          guestEntries
            .map((g) => g.userPromoterId)
            .filter((id): id is Id<"users"> => id !== undefined)
        )
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
        if (!promoterId) continue; // Skip guests without a promoter
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

// export const getPromoterGuestStats = query({
//   args: {
//     eventId: v.id("events"),
//   },
//   handler: async (ctx, args): Promise<GetPromoterGuestStatsResponse> => {
//     const { eventId } = args;
//     try {
//       const identity = await requireAuthenticatedUser(ctx, [
//         UserRole.Admin,
//         UserRole.Hostly_Admin,
//         UserRole.Hostly_Moderator,
//         UserRole.Moderator,
//         UserRole.Manager,
//         UserRole.Promoter,
//       ]);

//       const clerkUserId = identity.id as string;

//       const user = validateUser(
//         await ctx.db
//           .query("users")
//           .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
//           .first()
//       );

//       const event = validateEvent(await ctx.db.get(eventId));
//       isUserInCompanyOfEvent(user, event);

//       const guestListInfo: GuestListInfoSchema | null = await ctx.db
//         .query("guestListInfo")
//         .first();

//       if (!guestListInfo) {
//         return {
//           status: ResponseStatus.SUCCESS,
//           data: { promoterGuestStats: [] },
//         };
//       }

//       const isManager = [
//         UserRole.Admin,
//         UserRole.Hostly_Admin,
//         UserRole.Hostly_Moderator,
//         UserRole.Moderator,
//         UserRole.Manager,
//       ].includes(user.role as UserRole);

//       const allEntries = await ctx.db
//         .query("guestListEntries")
//         .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
//         .filter((q) => q.eq(q.field("isActive"), true))
//         .collect();

//       const entriesToUse = isManager
//         ? allEntries
//         : allEntries.filter((e) => e.userPromoterId === user._id);

//       const grouped = new Map<
//         Id<"users">,
//         Omit<PromoterGuestStatsData, "entries">
//       >();

//       let totalMales = 0;
//       let totalFemales = 0;
//       let totalRSVPs = 0;
//       let totalCheckedIn = 0;
//       for (const entry of entriesToUse) {
//         const promoterId = entry.userPromoterId;
//         if (!promoterId) continue;

//         const existing = grouped.get(promoterId) ?? {
//           promoterId,
//           promoterName: "",
//           totalMales: 0,
//           totalFemales: 0,
//           totalRSVPs: 0,
//           totalCheckedIn: 0,
//         };

//         const males = entry.malesInGroup ?? 0;
//         const females = entry.femalesInGroup ?? 0;

//         existing.totalMales += males;
//         existing.totalFemales += females;
//         existing.totalRSVPs += 1;
//         existing.totalCheckedIn += entry.attended ? 1 : 0;

//         grouped.set(promoterId, existing);

//         if (isManager) {
//           totalMales += males;
//           totalFemales += females;
//           totalRSVPs += 1;
//           totalCheckedIn += entry.attended ? 1 : 0;
//         }
//       }

//       const promoterIds = Array.from(grouped.keys());
//       const users = await Promise.all(promoterIds.map((id) => ctx.db.get(id)));

//       users
//         .filter((u) => u !== null)
//         .forEach((u) => {
//           const summary = grouped.get(u!._id);
//           if (summary) summary.promoterName = u!.name ?? "";
//         });

//       const sortedStats = Array.from(grouped.values()).sort(
//         (a, b) => b.totalCheckedIn - a.totalCheckedIn
//       );

//       const data: {
//         promoterGuestStats: Omit<PromoterGuestStatsData, "entries">[];
//         checkInData?: CheckInData;
//       } = {
//         promoterGuestStats: sortedStats,
//       };

//       if (isManager) {
//         data.checkInData = {
//           totalCheckedIn,
//           totalMales,
//           totalFemales,
//           totalRSVPs,
//         };
//       }

//       return {
//         status: ResponseStatus.SUCCESS,
//         data,
//       };
//     } catch (error) {
//       return handleError(error);
//     }
//   },
// });

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

      const guestListInfo: GuestListInfoSchema | null = await ctx.db
        .query("guestListInfo")
        .first();

      if (!guestListInfo) {
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
        string, // userId as string or "company"
        Omit<PromoterGuestStatsData, "entries">
      >();

      let totalMales = 0;
      let totalFemales = 0;
      let totalRSVPs = 0;
      let totalCheckedIn = 0;

      for (const entry of entriesToUse) {
        const promoterKey = entry.userPromoterId ?? "company";

        const existing = grouped.get(promoterKey) ?? {
          promoterId: promoterKey as any,
          promoterName: promoterKey === "company" ? "Company" : "",
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

        grouped.set(promoterKey, existing);

        if (isManager) {
          totalMales += males;
          totalFemales += females;
          totalRSVPs += 1;
          totalCheckedIn += entry.attended ? 1 : 0;
        }
      }

      const promoterIds = Array.from(grouped.keys()).filter(
        (id) => id !== "company"
      ) as Id<"users">[];

      const users = await Promise.all(promoterIds.map((id) => ctx.db.get(id)));

      users
        .filter((u) => u !== null)
        .forEach((u) => {
          const summary = grouped.get(u!._id);
          if (summary) summary.promoterName = u!.name ?? "";
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

      // Sort leaderboard alphabetically by name (including Company)
      promoterLeaderboard.sort((a, b) => a.name.localeCompare(b.name));

      return {
        status: ResponseStatus.SUCCESS,
        data: {
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
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const addPublicGuestListEntry = mutation({
  args: {
    name: v.string(),
    phoneNumber: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<AddPublicGuestListEntryResponse> => {
    const { name, phoneNumber, eventId } = args;

    try {
      validateEvent(await ctx.db.get(eventId));
      const guestListInfo = validateGuestListInfo(
        await ctx.db
          .query("guestListInfo")
          .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
          .first()
      );

      const isGuestListOpen = guestListInfo.guestListCloseTime > Date.now();
      if (!isGuestListOpen) {
        throw new Error(ShowErrorMessages.GUEST_LIST_CLOSED);
      }

      const guestEntryId = await ctx.db.insert("guestListEntries", {
        name,
        phoneNumber,
        eventId,
        isActive: true,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestEntryId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
