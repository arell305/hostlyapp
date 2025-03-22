import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { TicketCounts, TicketInput } from "@/types/types";
import { ErrorMessages, Gender, UserRole, ResponseStatus } from "@/types/enums";
import { Id } from "./_generated/dataModel";
import {
  CustomerTicket,
  TicketSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import {
  CheckInTicketResponse,
  GetTicketsByClerkUserResponse,
  GetTicketsByEventIdResponse,
  InsertTicketSoldResponse,
} from "@/types/convex-types";
import { nanoid } from "nanoid";
import { internal } from "./_generated/api";
import { generatePDF } from "../utils/pdf";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateEvent,
  validateUser,
  validateTicket,
  validateTicketCheckIn,
} from "./backendUtils/validation";
import { handleError, isUserInCompanyOfEvent } from "./backendUtils/helper";
import { DateTime } from "luxon";

export const insertTicketsSold = action({
  args: {
    eventId: v.id("events"),
    promoCode: v.union(v.string(), v.null()),
    email: v.string(),
    maleCount: v.number(),
    femaleCount: v.number(),
  },
  handler: async (ctx, args): Promise<InsertTicketSoldResponse> => {
    const { eventId, promoCode, email, maleCount, femaleCount } = args;
    try {
      const { event, promoterUserId } = await ctx.runQuery(
        internal.events.getEventsWithTickets,
        {
          eventId,
          promoCode,
        }
      );

      const shortEventId = event._id.slice(0, 4);
      const tickets: CustomerTicket[] = [];

      const createCustomerTicket = (ticket: TicketSchema): CustomerTicket => ({
        ...ticket,
        name: event.name,
        startTime: event.startTime,
        endTime: event.endTime,
        address: event.address,
      });

      for (let i = 0; i < maleCount; i++) {
        const ticketUniqueId = `${shortEventId}_${nanoid(6)}`;
        const ticketInput: TicketInput = {
          eventId,
          promoterUserId,
          email,
          gender: Gender.Male,
          ticketUniqueId,
        };
        const ticketId = await ctx.runMutation(internal.tickets.insertTicket, {
          ticketInput,
        });

        const ticket = await ctx.runQuery(internal.tickets.getTicketById, {
          ticketId,
        });
        if (ticket) tickets.push(createCustomerTicket(ticket));
      }

      for (let i = 0; i < femaleCount; i++) {
        const ticketUniqueId = `${shortEventId}_${nanoid(6)}`;
        const ticketInput: TicketInput = {
          eventId,
          promoterUserId,
          email,
          gender: Gender.Male,
          ticketUniqueId,
        };

        const ticketId = await ctx.runMutation(internal.tickets.insertTicket, {
          ticketInput,
        });

        const ticket = await ctx.runQuery(internal.tickets.getTicketById, {
          ticketId,
        });
        if (ticket) tickets.push(createCustomerTicket(ticket));
      }

      await generatePDF(tickets, email);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          tickets,
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

      const tickets: TicketSchema[] = await ctx.db
        .query("tickets")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .collect();

      const promoterIds = Array.from(
        new Set(
          tickets
            .map((ticket) => ticket.promoterUserId)
            .filter((id): id is Id<"users"> => id !== null)
        )
      );

      const allUsers = await ctx.db.query("users").collect();

      const promoterMap = allUsers.reduce(
        (acc, user) => {
          if (user._id && promoterIds.includes(user._id)) {
            acc[user._id] = user.name || null;
          }
          return acc;
        },
        {} as Record<string, string | null>
      );

      const ticketsWithPromoterName: TicketSchemaWithPromoter[] = tickets.map(
        (ticket) => ({
          ...ticket,
          promoterName: ticket.promoterUserId
            ? promoterMap[ticket.promoterUserId] || null
            : null,
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

export const getTicketsByClerkUser = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<GetTicketsByClerkUserResponse> => {
    const { eventId } = args;

    try {
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

      const tickets: TicketSchema[] = await ctx.db
        .query("tickets")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .collect();

      const ticketCounts: TicketCounts = tickets.reduce(
        (acc, ticket) => {
          if (ticket.gender === Gender.Male) {
            acc.male += 1;
          } else if (ticket.gender === Gender.Female) {
            acc.female += 1;
          }
          return acc;
        },
        { male: 0, female: 0 }
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: { ticketCounts },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
