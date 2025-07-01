import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { TicketInput } from "@/types/types";
import { ErrorMessages, Gender, UserRole, ResponseStatus } from "@/types/enums";
import { Id } from "./_generated/dataModel";
import {
  CustomerTicket,
  TicketSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import {
  CheckInTicketResponse,
  GetPromoterTicketKpisResponse,
  GetPromoterTicketSalesByTypeResponse,
  GetTicketSalesByPromoterResponse,
  GetTicketsByEventIdResponse,
  GetTicketTypeBreakdownByClerkUserResponse,
} from "@/types/convex-types";
import { nanoid } from "nanoid";
import { api, internal } from "./_generated/api";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateEvent,
  validateUser,
  validateTicket,
  validateTicketCheckIn,
} from "./backendUtils/validation";
import { handleError, isUserInCompanyOfEvent } from "./backendUtils/helper";
import { DateTime } from "luxon";
import { formatToPstShortDate } from "@/utils/luxon";
import { startOfPstDay } from "@/utils/luxon";

export const insertTicketsSold = action({
  args: {
    eventId: v.id("events"),
    organizationId: v.id("organizations"),
    promoCode: v.union(v.string(), v.null()),
    email: v.string(),
    totalAmount: v.number(),
    stripePaymentIntentId: v.string(),
    ticketCounts: v.array(
      v.object({
        eventTicketTypeId: v.id("eventTicketTypes"),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const {
      eventId,
      organizationId,
      promoCode,
      email,
      totalAmount,
      stripePaymentIntentId,
      ticketCounts,
    } = args;

    try {
      const connectedPaymentId = await ctx.runMutation(
        internal.connectedPayments.insertConnectedPayment,
        {
          eventId,
          stripePaymentIntentId,
          email,
          totalAmount,
          promoCode,
          ticketCounts,
          organizationId,
        }
      );

      const { event, promoterUserId } = await ctx.runQuery(
        internal.events.getEventsWithTickets,
        {
          eventId,
          promoCode,
        }
      );

      const shortEventId = event._id.slice(0, 4);
      const tickets: CustomerTicket[] = [];

      for (const { eventTicketTypeId, quantity } of ticketCounts) {
        const ticketType = await ctx.runQuery(
          internal.eventTicketTypes.getEventTicketTypes,
          {
            eventTicketTypesId: eventTicketTypeId,
          }
        );
        if (!ticketType || ticketType.eventId !== eventId) {
          throw new Error("Invalid or mismatched ticket type");
        }

        for (let i = 0; i < quantity; i++) {
          const ticketUniqueId = `${shortEventId}_${nanoid(6)}`;
          const ticketInput: TicketInput = {
            eventId,
            promoterUserId,
            email,
            ticketUniqueId,
            organizationId,
            eventTicketTypeId,
          };

          const ticketId = await ctx.runMutation(
            internal.tickets.insertTicket,
            {
              ticketInput,
            }
          );

          const ticket = await ctx.runQuery(internal.tickets.getTicketById, {
            ticketId,
          });

          if (ticket) {
            const customerTicket: CustomerTicket = {
              ...ticket,
              name: event.name,
              startTime: event.startTime,
              endTime: event.endTime,
              address: event.address,
              connectedPaymentId,
              organizationId,
              eventTicketTypeName: ticketType.name,
            };
            tickets.push(customerTicket);
          }
        }
      }

      await ctx.runAction(api.pdfMonkey.generatePDF, {
        tickets: tickets.map(
          ({
            connectedPaymentId,
            organizationId,
            _creationTime,
            eventTicketTypeId,
            ...rest
          }) => rest
        ),
        email,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          tickets,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getTicketsByEventId = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args): Promise<GetTicketsByEventIdResponse> => {
    const { eventId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Moderator,
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

      let tickets: TicketSchema[];

      if (user.role === UserRole.Promoter) {
        tickets = await ctx.db
          .query("tickets")
          .withIndex("by_eventId_and_promoterUserId", (q) =>
            q.eq("eventId", eventId).eq("promoterUserId", user._id)
          )
          .collect();
      } else {
        tickets = await ctx.db
          .query("tickets")
          .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
          .collect();
      }

      const promoterIds = Array.from(
        new Set(
          tickets
            .map((ticket) => ticket.promoterUserId)
            .filter((id): id is Id<"users"> => id !== null)
        )
      );

      const ticketTypeIds = Array.from(
        new Set(tickets.map((t) => t.eventTicketTypeId))
      );

      const [allUsers, ticketTypeDocs] = await Promise.all([
        ctx.db.query("users").collect(),
        Promise.all(ticketTypeIds.map((id) => ctx.db.get(id))),
      ]);

      const promoterMap = allUsers.reduce(
        (acc, user) => {
          if (user._id && promoterIds.includes(user._id)) {
            acc[user._id] = user.name || null;
          }
          return acc;
        },
        {} as Record<string, string | null>
      );

      const ticketTypeMap = ticketTypeDocs.reduce(
        (acc, ticketType) => {
          if (ticketType) acc[ticketType._id] = ticketType.name;
          return acc;
        },
        {} as Record<string, string>
      );

      const ticketsWithPromoterName: TicketSchemaWithPromoter[] = tickets.map(
        (ticket) => ({
          ...ticket,
          promoterName: ticket.promoterUserId
            ? promoterMap[ticket.promoterUserId] || null
            : null,
          ticketTypeName: ticketTypeMap[ticket.eventTicketTypeId] ?? "Unknown",
        })
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: { tickets: ticketsWithPromoterName },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const checkInTicket = mutation({
  args: { ticketUniqueId: v.string() },
  handler: async (ctx, args): Promise<CheckInTicketResponse> => {
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Moderator,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .first()
      );

      const ticket = validateTicket(
        await ctx.db
          .query("tickets")
          .filter((q) => q.eq(q.field("ticketUniqueId"), args.ticketUniqueId))
          .first()
      );

      const event = validateEvent(
        await ctx.db
          .query("events")
          .filter((q) => q.eq(q.field("_id"), ticket.eventId))
          .first()
      );

      isUserInCompanyOfEvent(user, event);

      validateTicketCheckIn(ticket, event);

      await ctx.db.patch(ticket._id, {
        checkInTime: DateTime.now().toMillis(),
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: { ticketId: ticket._id },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const insertTicket = internalMutation({
  handler: async (
    ctx,
    { ticketInput }: { ticketInput: TicketInput }
  ): Promise<Id<"tickets">> => {
    try {
      const ticketId = await ctx.db.insert("tickets", ticketInput);

      return ticketId;
    } catch (error) {
      console.error("Error inserting ticket:", error);
      throw new Error(ErrorMessages.TICKET_INSERT);
    }
  },
});

export const getTicketById = internalQuery({
  handler: async (ctx, { ticketId }: { ticketId: Id<"tickets"> }) => {
    try {
      const ticket = await ctx.db.get(ticketId);
      if (!ticket) {
        throw new Error(ErrorMessages.TICKET_NOT_FOUND);
      }
      return ticket;
    } catch (error) {
      console.error("Error fetching ticket:", error);
      throw new Error(ErrorMessages.TICKET_DB_QUERY);
    }
  },
});

export const getTicketTypeBreakdownByClerkUser = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (
    ctx,
    args
  ): Promise<GetTicketTypeBreakdownByClerkUserResponse> => {
    try {
      const { eventId } = args;

      const identity = await requireAuthenticatedUser(ctx, [UserRole.Promoter]);
      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
          .first()
      );

      const event = validateEvent(await ctx.db.get(eventId));
      isUserInCompanyOfEvent(user, event);

      const [tickets, ticketTypes] = await Promise.all([
        ctx.db
          .query("tickets")
          .withIndex("by_eventId_and_promoterUserId", (q) =>
            q.eq("eventId", event._id).eq("promoterUserId", user._id)
          )
          .collect(),
        ctx.db
          .query("eventTicketTypes")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .collect(),
      ]);

      const nameMap = new Map(ticketTypes.map((type) => [type._id, type.name]));

      const countMap = new Map<string, number>();

      for (const ticket of tickets) {
        const typeId = ticket.eventTicketTypeId;
        countMap.set(typeId, (countMap.get(typeId) || 0) + 1);
      }

      const result = Array.from(countMap.entries()).map(
        ([eventTicketTypeId, count]) => ({
          eventTicketTypeId: eventTicketTypeId as Id<"eventTicketTypes">,
          name:
            nameMap.get(eventTicketTypeId as Id<"eventTicketTypes">) ||
            "Unknown",
          count,
        })
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: result,
      };
    } catch (error) {
      return handleError(error); // must return ErrorResponse type
    }
  },
});

export const getTicketsByEvent = internalQuery({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }): Promise<TicketSchema[]> => {
    try {
      return await ctx.db
        .query("tickets")
        .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
        .collect();
    } catch (error) {
      console.error("Error in getTicketsByEvent:", error);
      return [];
    }
  },
});

export const getPromoterTicketKpis = query({
  args: {
    fromTimestamp: v.number(),
    toTimestamp: v.number(),
  },
  handler: async (ctx, args): Promise<GetPromoterTicketKpisResponse> => {
    const { fromTimestamp, toTimestamp } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [UserRole.Promoter]);
      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
          .unique()
      );

      const events = await ctx.db
        .query("events")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .collect();

      const getTicketsForRange = async (from: number, to: number) => {
        const filteredEventIds = events
          .filter((event) => event.startTime >= from && event.startTime <= to)
          .map((e) => e._id);

        const ticketsArrays = await Promise.all(
          filteredEventIds.map((eventId) =>
            ctx.db
              .query("tickets")
              .withIndex("by_eventId_and_promoterUserId", (q) =>
                q.eq("eventId", eventId).eq("promoterUserId", user._id)
              )
              .collect()
          )
        );

        return ticketsArrays.flat();
      };

      const [currentTickets, previousTickets] = await Promise.all([
        getTicketsForRange(fromTimestamp, toTimestamp),
        getTicketsForRange(
          fromTimestamp - (toTimestamp - fromTimestamp),
          fromTimestamp
        ),
      ]);

      const getTicketTypeCounts = async (tickets: TicketSchema[]) => {
        const ticketTypeMap = new Map<string, number>();

        for (const ticket of tickets) {
          const id = ticket.eventTicketTypeId;
          ticketTypeMap.set(id, (ticketTypeMap.get(id) || 0) + 1);
        }

        const ticketTypeDocs = await Promise.all(
          Array.from(ticketTypeMap.keys()).map((id) =>
            ctx.db.get(id as Id<"eventTicketTypes">)
          )
        );

        return Array.from(ticketTypeMap.entries()).map(([id, count], i) => ({
          eventTicketTypeId: id as Id<"eventTicketTypes">,
          name: ticketTypeDocs[i]?.name || "Unknown",
          count,
        }));
      };

      const currentStats = await getTicketTypeCounts(currentTickets);
      const previousStats = await getTicketTypeCounts(previousTickets);

      const getChange = (curr: number, prev: number) => {
        if (prev === 0) return curr === 0 ? 0 : 100;
        return ((curr - prev) / prev) * 100;
      };

      const sum = (items: typeof currentStats) =>
        items.reduce((total, item) => total + item.count, 0);

      const totalCurrent = sum(currentStats);
      const totalPrevious = sum(previousStats);

      const dayCount =
        Math.ceil((toTimestamp - fromTimestamp) / (1000 * 60 * 60 * 24)) || 1;

      const dailyBreakdownMap: Record<
        string,
        {
          eventTicketTypeId: Id<"eventTicketTypes">;
          name: string;
          count: number;
        }[]
      > = {};

      const ticketTypeNameMap = new Map<Id<"eventTicketTypes">, string>();

      const allTicketTypeIds = Array.from(
        new Set(currentTickets.map((t) => t.eventTicketTypeId))
      );

      const allTicketTypes = await Promise.all(
        allTicketTypeIds.map((id) => ctx.db.get(id))
      );

      allTicketTypes.forEach((type) => {
        if (type) ticketTypeNameMap.set(type._id, type.name);
      });

      let cursor = startOfPstDay(fromTimestamp);
      const end = startOfPstDay(toTimestamp);

      while (cursor <= end) {
        const key = formatToPstShortDate(cursor.toMillis());
        dailyBreakdownMap[key] = [];
        cursor = cursor.plus({ days: 1 });
      }

      for (const ticket of currentTickets) {
        const dateKey = formatToPstShortDate(
          startOfPstDay(ticket._creationTime).toMillis()
        );
        const list = dailyBreakdownMap[dateKey];
        const typeId = ticket.eventTicketTypeId;
        const existing = list.find((x) => x.eventTicketTypeId === typeId);

        if (existing) {
          existing.count += 1;
        } else {
          list.push({
            eventTicketTypeId: typeId,
            name: ticketTypeNameMap.get(typeId) || "Unknown",
            count: 1,
          });
        }
      }

      const dailyTicketSales = Object.entries(dailyBreakdownMap).map(
        ([date, counts]) => ({ date, counts })
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          totalTickets: {
            value: totalCurrent,
            change: getChange(totalCurrent, totalPrevious),
          },
          avgTicketsPerDay: {
            value: totalCurrent / dayCount,
            change: getChange(
              totalCurrent / dayCount,
              totalPrevious / dayCount
            ),
          },
          dailyTicketSales,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getTicketSalesByPromoterWithDetails = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<GetTicketSalesByPromoterResponse> => {
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Hostly_Admin,
        UserRole.Hostly_Moderator,
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Moderator,
        UserRole.Promoter,
      ]);

      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .first()
      );

      const event = validateEvent(await ctx.db.get(args.eventId));
      isUserInCompanyOfEvent(user, event);

      const ticketTypes = await ctx.db
        .query("eventTicketTypes")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .collect();

      if (ticketTypes.length === 0) {
        return {
          status: ResponseStatus.SUCCESS,
          data: { tickets: [], ticketTotals: null },
        };
      }

      const isManager = [
        UserRole.Admin,
        UserRole.Hostly_Admin,
        UserRole.Hostly_Moderator,
        UserRole.Manager,
        UserRole.Moderator,
      ].includes(user.role as UserRole);

      const allTickets = await ctx.db
        .query("tickets")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .collect();

      const ticketsToUse = isManager
        ? allTickets
        : allTickets.filter((t) => t.promoterUserId === user._id);

      // Build ticket type name map
      const ticketTypeMap = new Map(ticketTypes.map((tt) => [tt._id, tt.name]));

      const grouped = new Map<
        Id<"users">,
        {
          promoterId: Id<"users">;
          promoterName: string;
          sales: {
            eventTicketTypeId: Id<"eventTicketTypes">;
            name: string;
            count: number;
          }[];
        }
      >();

      const promoterTypeCountMap = new Map<
        Id<"users">,
        Map<Id<"eventTicketTypes">, number>
      >();

      // Count tickets per promoter per ticket type
      for (const ticket of ticketsToUse) {
        if (!ticket.promoterUserId) continue;

        const promoterId = ticket.promoterUserId;
        const typeId = ticket.eventTicketTypeId;

        if (!promoterTypeCountMap.has(promoterId)) {
          promoterTypeCountMap.set(promoterId, new Map());
        }

        const typeMap = promoterTypeCountMap.get(promoterId)!;
        typeMap.set(typeId, (typeMap.get(typeId) || 0) + 1);
      }

      // Populate grouped structure
      for (const [promoterId, typeCounts] of promoterTypeCountMap.entries()) {
        const sales = Array.from(typeCounts.entries()).map(
          ([typeId, count]) => ({
            eventTicketTypeId: typeId,
            name: ticketTypeMap.get(typeId) || "Unknown",
            count,
          })
        );

        grouped.set(promoterId, {
          promoterId,
          promoterName: "", // to be filled later
          sales,
        });
      }

      // Fetch promoter names
      const promoterIds = Array.from(grouped.keys());
      const users = await Promise.all(promoterIds.map((id) => ctx.db.get(id)));

      users.forEach((u) => {
        if (!u) return;
        const group = grouped.get(u._id);
        if (group) group.promoterName = u.name ?? "Unknown";
      });

      // Build total count across all promoters, grouped by ticket type
      const totalTypeCountMap = new Map<Id<"eventTicketTypes">, number>();
      for (const ticket of ticketsToUse) {
        const typeId = ticket.eventTicketTypeId;
        totalTypeCountMap.set(typeId, (totalTypeCountMap.get(typeId) || 0) + 1);
      }

      const ticketTotals = Array.from(totalTypeCountMap.entries()).map(
        ([typeId, count]) => ({
          eventTicketTypeId: typeId,
          name: ticketTypeMap.get(typeId) || "Unknown",
          count,
        })
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          tickets: Array.from(grouped.values()).sort((a, b) => {
            const aTotal = a.sales.reduce((sum, s) => sum + s.count, 0);
            const bTotal = b.sales.reduce((sum, s) => sum + s.count, 0);
            return bTotal - aTotal;
          }),
          ticketTotals,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const internalGetTicketsByEventId = internalQuery({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<TicketSchema[]> => {
    const { eventId } = args;
    try {
      const results = await ctx.db
        .query("tickets")
        .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
        .collect();

      return results;
    } catch (error) {
      console.error("Error fetching tickets by event ID:", error);
      throw new Error(ErrorMessages.TICKETS_DB_QUERY_BY_EVENT_ID_ERROR);
    }
  },
});

export const getPromoterTicketSalesByType = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (
    ctx,
    { eventId }
  ): Promise<GetPromoterTicketSalesByTypeResponse> => {
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Hostly_Admin,
        UserRole.Hostly_Moderator,
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Promoter,
      ]);

      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
          .unique()
      );

      // Step 2: Get all tickets for this event and promoter
      const tickets: TicketSchema[] = await ctx.db
        .query("tickets")
        .withIndex("by_eventId_and_promoterUserId", (q) =>
          q.eq("eventId", eventId).eq("promoterUserId", user._id)
        )
        .collect();

      if (tickets.length === 0) {
        return {
          status: ResponseStatus.SUCCESS,
          data: [],
        };
      }

      // Step 3: Count how many of each ticket type were sold
      const ticketTypeCounts: Record<Id<"eventTicketTypes">, number> = {};
      for (const ticket of tickets) {
        const typeId = ticket.eventTicketTypeId;
        ticketTypeCounts[typeId] = (ticketTypeCounts[typeId] || 0) + 1;
      }

      // Step 4: Fetch ticket type names
      const ticketTypeIds = Object.keys(
        ticketTypeCounts
      ) as Id<"eventTicketTypes">[];
      const ticketTypes = await Promise.all(
        ticketTypeIds.map((id) => ctx.db.get(id))
      );

      // Step 5: Return name + count
      const result = ticketTypes
        .filter((type): type is NonNullable<typeof type> => !!type)
        .map((type) => ({
          name: type.name,
          count: ticketTypeCounts[type._id],
        }));

      return {
        status: ResponseStatus.SUCCESS,
        data: result,
      };
    } catch (error: any) {
      return handleError(error);
    }
  },
});

// export const getTicketSalesByPromoterWithDetails = query({
//   args: {
//     eventId: v.id("events"),
//   },
//   handler: async (ctx, args): Promise<GetTicketSalesByPromoterResponse> => {
//     try {
//       const identity = await requireAuthenticatedUser(ctx, [
//         UserRole.Hostly_Admin,
//         UserRole.Hostly_Moderator,
//         UserRole.Admin,
//         UserRole.Manager,
//         UserRole.Moderator,
//         UserRole.Promoter,
//       ]);

//       const clerkUserId = identity.id as string;
//       const user = validateUser(
//         await ctx.db
//           .query("users")
//           .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
//           .first()
//       );

//       const event = validateEvent(await ctx.db.get(args.eventId));
//       isUserInCompanyOfEvent(user, event);

//       const ticketTypes: EventTicketTypesSchema[] = await ctx.db
//         .query("eventTicketTypes")
//         .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
//         .collect();

//       if (ticketTypes.length === 0) {
//         return {
//           status: ResponseStatus.SUCCESS,
//           data: { tickets: [], ticketTotals: null },
//         };
//       }

//       const isManager = [
//         UserRole.Admin,
//         UserRole.Hostly_Admin,
//         UserRole.Hostly_Moderator,
//         UserRole.Manager,
//         UserRole.Moderator,
//       ].includes(user.role as UserRole);

//       const allTickets = await ctx.db
//         .query("tickets")
//         .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
//         .collect();

//       const ticketsToUse = isManager
//         ? allTickets
//         : allTickets.filter((t) => t.promoterUserId === user._id);

//       const grouped = new Map<
//         Id<"users">,
//         {
//           promoterId: Id<"users">;
//           promoterName: string;
//           maleCount: number;
//           femaleCount: number;
//         }
//       >();

//       let totalMales = 0;
//       let totalFemales = 0;

//       for (const ticket of ticketsToUse) {
//         const promoterId = ticket.promoterUserId;

//         if (ticket.gender === Gender.Male) {
//           totalMales += 1;
//         } else if (ticket.gender === Gender.Female) {
//           totalFemales += 1;
//         }

//         if (!promoterId) continue;

//         const existing = grouped.get(promoterId) ?? {
//           promoterId,
//           promoterName: "",
//           maleCount: 0,
//           femaleCount: 0,
//         };

//         if (ticket.gender === Gender.Male) {
//           existing.maleCount += 1;
//         } else if (ticket.gender === Gender.Female) {
//           existing.femaleCount += 1;
//         }

//         grouped.set(promoterId, existing);
//       }

//       // Fetch promoter names
//       const promoterIds = Array.from(grouped.keys());
//       const users = await Promise.all(promoterIds.map((id) => ctx.db.get(id)));

//       users.forEach((u) => {
//         if (!u) return;
//         const group = grouped.get(u._id);
//         if (group) group.promoterName = u.name ?? "Unknown";
//       });
//       return {
//         status: ResponseStatus.SUCCESS,
//         data: {
//           tickets: Array.from(grouped.values()).sort(
//             (a, b) =>
//               b.maleCount + b.femaleCount - (a.maleCount + a.femaleCount)
//           ),
//           ticketTotals: {
//             maleCount: totalMales,
//             femaleCount: totalFemales,
//           },
//         },
//       };
//     } catch (error) {
//       return handleError(error);
//     }
//   },
// });

// export const getPromoterTicketKpis = query({
//   args: {
//     fromTimestamp: v.number(),
//     toTimestamp: v.number(),
//   },
//   handler: async (ctx, args): Promise<GetPromoterTicketKpisResponse> => {
//     const { fromTimestamp, toTimestamp } = args;

//     try {
//       const identity = await requireAuthenticatedUser(ctx, [UserRole.Promoter]);
//       const clerkUserId = identity.id as string;

//       const user = validateUser(
//         await ctx.db
//           .query("users")
//           .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
//           .unique()
//       );

//       const events = await ctx.db
//         .query("events")
//         .withIndex("by_organizationId", (q) =>
//           q.eq("organizationId", user.organizationId)
//         )
//         .collect();

//       const getTicketsForRange = async (from: number, to: number) => {
//         const filteredEventIds = events
//           .filter((event) => event.startTime >= from && event.startTime <= to)
//           .map((e) => e._id);

//         const ticketsArrays = await Promise.all(
//           filteredEventIds.map((eventId) =>
//             ctx.db
//               .query("tickets")
//               .withIndex("by_eventId_and_promoterUserId", (q) =>
//                 q.eq("eventId", eventId).eq("promoterUserId", user._id)
//               )
//               .collect()
//           )
//         );

//         return ticketsArrays.flat();
//       };

//       const currentTickets = await getTicketsForRange(
//         fromTimestamp,
//         toTimestamp
//       );
//       const previousFrom = fromTimestamp - (toTimestamp - fromTimestamp);
//       const previousTickets = await getTicketsForRange(
//         previousFrom,
//         fromTimestamp
//       );

//       const countByGender = (tickets: any[]) => ({
//         maleCount: tickets.filter((t) => t.gender === Gender.Male).length,
//         femaleCount: tickets.filter((t) => t.gender === Gender.Female).length,
//       });

//       const currentStats = countByGender(currentTickets);
//       const previousStats = countByGender(previousTickets);

//       const getChange = (current: number, previous: number) => {
//         if (previous === 0) return current === 0 ? 0 : 100;
//         return ((current - previous) / previous) * 100;
//       };

//       const generateDateMap = (from: number, to: number) => {
//         const days: Record<string, { male: number; female: number }> = {};
//         let cursor = startOfPstDay(from);
//         const end = startOfPstDay(to);

//         while (cursor <= end) {
//           const key = formatToPstShortDate(cursor.toMillis());
//           days[key] = { male: 0, female: 0 };
//           cursor = cursor.plus({ days: 1 });
//         }

//         return days;
//       };

//       const dailyCounts = generateDateMap(fromTimestamp, toTimestamp);

//       for (const ticket of currentTickets) {
//         const dateKey = formatToPstShortDate(
//           startOfPstDay(ticket._creationTime).toMillis()
//         );
//         if (dateKey && dailyCounts[dateKey]) {
//           if (ticket.gender === Gender.Male) dailyCounts[dateKey].male += 1;
//           if (ticket.gender === Gender.Female) dailyCounts[dateKey].female += 1;
//         }
//       }

//       const dailyTicketSales = Object.entries(dailyCounts).map(
//         ([date, { male, female }]) => ({
//           date,
//           male,
//           female,
//         })
//       );

//       const dayCount =
//         Math.ceil((toTimestamp - fromTimestamp) / (1000 * 60 * 60 * 24)) || 1;

//       return {
//         status: ResponseStatus.SUCCESS,
//         data: {
//           totalMale: {
//             value: currentStats.maleCount,
//             change: getChange(currentStats.maleCount, previousStats.maleCount),
//           },
//           totalFemale: {
//             value: currentStats.femaleCount,
//             change: getChange(
//               currentStats.femaleCount,
//               previousStats.femaleCount
//             ),
//           },
//           avgMalePerDay: {
//             value: currentStats.maleCount / dayCount,
//             change: getChange(
//               currentStats.maleCount / dayCount,
//               previousStats.maleCount / dayCount
//             ),
//           },
//           avgFemalePerDay: {
//             value: currentStats.femaleCount / dayCount,
//             change: getChange(
//               currentStats.femaleCount / dayCount,
//               previousStats.femaleCount / dayCount
//             ),
//           },
//           dailyTicketSales,
//         },
//       };
//     } catch (error) {
//       return handleError(error);
//     }
//   },
// });
