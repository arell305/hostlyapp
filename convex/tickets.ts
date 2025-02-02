import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import {
  EventSchema,
  InsertTicektResponse,
  TicketInput,
  UserSchema,
} from "@/types/types";
import { ErrorMessages, Gender } from "@/types/enums";
import { ResponseStatus, UserRole } from "../utils/enum";
import { Id } from "./_generated/dataModel";
import {
  CustomerTicket,
  PromoterPromoCodeSchema,
  TicketSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import {
  CheckInTicketResponse,
  GetEventByIdResponse,
  GetTicketsByEventIdResponse,
  InsertTicketSoldResponse,
} from "@/types/convex-types";
import {
  formatToTimeAndShortDate,
  formatUnixToTimeAndShortDate,
  generateQRCodeBase64,
  isAfterNowInPacificTime,
} from "../utils/helpers";
import moment from "moment";
import { nanoid } from "nanoid";

import { api, internal } from "./_generated/api";
import { sendTicketEmail } from "../utils/sendgrid";
import { generatePDF } from "../utils/pdf";

// export const insertTicketsSold = mutation({
//   args: {
//     eventId: v.id("events"),
//     promoterPromoCodeId: v.union(v.id("promoterPromoCode"), v.null()),
//     email: v.string(),
//     maleCount: v.number(),
//     femaleCount: v.number(),
//   },
//   handler: async (ctx, args): Promise<InsertTicketSoldResponse> => {
//     try {
//       const event: EventSchema | null = await ctx.db.get(args.eventId);
//       if (!event) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.EVENT_NOT_FOUND,
//         };
//       }
//       const ticketInfo = await ctx.db
//         .query("ticketInfo")
//         .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
//         .unique();

//       if (!ticketInfo) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.TICKET_INFO_NOT_FOUND,
//         };
//       }

//       if (!isAfterNowInPacificTime(ticketInfo.ticketSalesEndTime)) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.TICKET_SALES_ENDED,
//         };
//       }

//       let clerkPromoterId: string | null = null;
//       if (args.promoterPromoCodeId) {
//         const promoterPromoCode: PromoterPromoCodeSchema | null =
//           await ctx.db.get(args.promoterPromoCodeId);
//         if (!promoterPromoCode) {
//           return {
//             status: ResponseStatus.ERROR,
//             data: null,
//             error: ErrorMessages.NOT_FOUND,
//           };
//         }
//         clerkPromoterId = promoterPromoCode.clerkPromoterUserId;
//       }

//       const shortEventId = event._id.slice(0, 4);

//       const tickets: CustomerTicket[] = [];

//       const createCustomerTicket = (ticket: TicketSchema): CustomerTicket => ({
//         ...ticket,
//         name: event.name,
//         startTime: event.startTime,
//         endTime: event.endTime,
//         address: event.address,
//       });

//       // Create male tickets
//       for (let i = 0; i < args.maleCount; i++) {
//         const ticketUniqueId = `${shortEventId}_${nanoid(6)}`;
//         const ticketId: Id<"tickets"> = await ctx.db.insert("tickets", {
//           eventId: args.eventId,
//           clerkPromoterId: clerkPromoterId,
//           email: args.email,
//           gender: Gender.Male,
//           ticketUniqueId,
//         });

//         const ticket: TicketSchema | null = await ctx.db.get(ticketId);
//         if (ticket) tickets.push(createCustomerTicket(ticket));
//       }

//       // Create female tickets
//       for (let i = 0; i < args.femaleCount; i++) {
//         const ticketUniqueId = `${shortEventId}_${nanoid(6)}`;
//         const ticketId: Id<"tickets"> = await ctx.db.insert("tickets", {
//           eventId: args.eventId,
//           clerkPromoterId: clerkPromoterId,
//           email: args.email,
//           gender: Gender.Female,
//           ticketUniqueId,
//         });

//         const ticket: TicketSchema | null = await ctx.db.get(ticketId);
//         if (ticket) tickets.push(createCustomerTicket(ticket));
//       }

//       const email =
//       return {
//         status: ResponseStatus.SUCCESS,
//         data: { tickets },
//       };
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
//       console.error(errorMessage, error);
//       return {
//         status: ResponseStatus.ERROR,
//         data: null,
//         error: errorMessage,
//       };
//     }
//   },
// });

export const insertTicketsSold = action({
  args: {
    eventId: v.id("events"),
    promoterPromoCodeId: v.union(v.id("promoterPromoCode"), v.null()),
    email: v.string(),
    maleCount: v.number(),
    femaleCount: v.number(),
  },
  handler: async (ctx, args): Promise<InsertTicketSoldResponse> => {
    try {
      const eventResponse: GetEventByIdResponse = await ctx.runQuery(
        api.events.getEventById,
        { eventId: args.eventId }
      );
      if (eventResponse.status !== ResponseStatus.SUCCESS) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: eventResponse.error || ErrorMessages.EVENT_NOT_FOUND,
        };
      }

      const ticketInfoId = eventResponse.data.ticketInfo?._id;

      if (!ticketInfoId) {
        // Handle the case where ticketInfoId is not available
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.TICKET_INFO_NOT_FOUND,
        };
      }

      // Now you can safely use ticketInfoId as an Id<"ticketInfo">
      const ticketInfo = await ctx.runQuery(api.ticketInfo.getTicketInfoById, {
        ticketInfoId: ticketInfoId as Id<"ticketInfo">, // Cast to Id<"ticketInfo">
      });

      if (!isAfterNowInPacificTime(ticketInfo.ticketSalesEndTime)) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.TICKET_SALES_ENDED,
        };
      }

      let clerkPromoterId: string | null = null;
      if (args.promoterPromoCodeId) {
        const promoterPromoCode: PromoterPromoCodeSchema | null =
          await ctx.runQuery(
            internal.promoterPromoCode.getPromoterPromoCodeById,
            {
              promoterPromoCodeId: args.promoterPromoCodeId,
            }
          );
        if (!promoterPromoCode) {
          return {
            status: ResponseStatus.ERROR,
            data: null,
            error: ErrorMessages.NOT_FOUND,
          };
        }
        clerkPromoterId = promoterPromoCode.clerkPromoterUserId;
      }

      const shortEventId = eventResponse.data.event._id.slice(0, 4);
      const tickets: CustomerTicket[] = [];

      const createCustomerTicket = (ticket: TicketSchema): CustomerTicket => ({
        ...ticket,
        name: eventResponse.data.event.name,
        startTime: eventResponse.data.event.startTime,
        endTime: eventResponse.data.event.endTime,
        address: eventResponse.data.event.address,
      });

      // Create male tickets
      for (let i = 0; i < args.maleCount; i++) {
        const ticketUniqueId = `${shortEventId}_${nanoid(6)}`;
        const ticketInput: TicketInput = {
          eventId: args.eventId,
          clerkPromoterId,
          email: args.email,
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

      // Create female tickets
      for (let i = 0; i < args.femaleCount; i++) {
        const ticketUniqueId = `${shortEventId}_${nanoid(6)}`;
        const ticketInput: TicketInput = {
          eventId: args.eventId,
          clerkPromoterId,
          email: args.email,
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

      const pdfBuffer = await generatePDF(tickets);

      await sendTicketEmail(args.email, tickets, pdfBuffer);

      return {
        status: ResponseStatus.SUCCESS,
        data: { tickets },
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
      if (
        role !== UserRole.Admin &&
        role !== UserRole.Manager &&
        role !== UserRole.Moderator &&
        role !== UserRole.Hostly_Admin &&
        role !== UserRole.Hostly_Moderator
      ) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const event: EventSchema | null = await ctx.db.get(args.eventId);
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
          error: ErrorMessages.NOT_BELONG,
        };
      }

      const tickets: TicketSchema[] = await ctx.db
        .query("tickets")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .collect();

      const promoterIds = Array.from(
        new Set(
          tickets
            .map((ticket) => ticket.clerkPromoterId)
            .filter((id): id is string => id !== null)
        )
      );

      // Fetch all users and filter in JavaScript
      const allUsers = await ctx.db.query("users").collect();

      // Create a map of promoterId to name
      const promoterMap = allUsers.reduce(
        (acc, user) => {
          if (user.clerkUserId && promoterIds.includes(user.clerkUserId)) {
            acc[user.clerkUserId] = user.name || null;
          }
          return acc;
        },
        {} as Record<string, string | null>
      );

      // Map tickets to include promoter names
      const ticketsWithPromoterName: TicketSchemaWithPromoter[] = tickets.map(
        (ticket) => ({
          ...ticket,
          promoterName: ticket.clerkPromoterId
            ? promoterMap[ticket.clerkPromoterId] || null
            : null,
        })
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: { tickets: ticketsWithPromoterName },
      };
    } catch (error) {
      console.error("Error fetching tickets:", error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: ErrorMessages.GENERIC_ERROR,
      };
    }
  },
});

export const checkInTicket = mutation({
  args: { ticketUniqueId: v.string() },
  handler: async (ctx, args): Promise<CheckInTicketResponse> => {
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

      const ticket: TicketSchema | null = await ctx.db
        .query("tickets")
        .filter((q) => q.eq(q.field("ticketUniqueId"), args.ticketUniqueId))
        .first();

      if (!ticket) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const event: EventSchema | null = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("_id"), ticket.eventId))
        .first();

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

      if (ticket.checkInTime) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: `Ticket already checked in on ${formatUnixToTimeAndShortDate(ticket.checkInTime)}`,
        };
      }

      const now = Date.now();
      const eventStartTime = moment(event.startTime).valueOf();
      const eventEndTime = moment(event.endTime).valueOf();

      if (now < eventStartTime || now > eventEndTime) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: `Invalid check in. Ticket is for ${event.name} on ${formatToTimeAndShortDate(event.startTime)}`,
        };
      }
      // Update the ticket to mark it as checked in
      await ctx.db.patch(ticket._id, {
        checkInTime: now,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: { ticketId: ticket._id },
      };
    } catch (error) {
      console.error("Error checking in ticket:", error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: ErrorMessages.GENERIC_ERROR,
      };
    }
  },
});

export const insertTicket = internalMutation({
  handler: async (
    ctx,
    { ticketInput }: { ticketInput: TicketInput }
  ): Promise<Id<"tickets">> => {
    // Insert the ticket into the database
    const ticketId = await ctx.db.insert("tickets", ticketInput);

    return ticketId; // Return the ID of the newly created ticket
  },
});

export const getTicketById = internalQuery({
  handler: async (ctx, { ticketId }: { ticketId: Id<"tickets"> }) => {
    // Retrieve the ticket from the database
    const ticket = await ctx.db.get(ticketId);

    // Check if ticket exists
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return ticket; // Return the ticket data
  },
});
