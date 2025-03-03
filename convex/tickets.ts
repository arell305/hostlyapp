import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { InsertTicektResponse, TicketInput, UserSchema } from "@/types/types";
import { ErrorMessages, Gender } from "@/types/enums";
import { ResponseStatus, UserRole } from "../utils/enum";
import { Id } from "./_generated/dataModel";
import {
  CustomerTicket,
  EventSchema,
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
  formatUnixToTimeAndShortDate,
  generateQRCodeBase64,
  isAfterNowInPacificTime,
} from "../utils/helpers";
import moment from "moment";
import { nanoid } from "nanoid";

import { api, internal } from "./_generated/api";
import { sendTicketEmail } from "../utils/sendgrid";
import { generatePDF } from "../utils/pdf";

import { USD_CURRENCY } from "@/types/constants";
import { getStripeCustomerIdForEmail } from "./stripe";
import { CreatePaymentIntentResponse } from "@/types/convex/actions-types";
import { stripe } from "./backendUtils/stripe";
import { requireAuthenticatedUser } from "../utils/auth";
import { validateEvent, validateUser } from "./backendUtils/validation";
import { isUserInCompanyOfEvent } from "./backendUtils/helper";
import { DateTime } from "luxon";
import { formatToTimeAndShortDate } from "../utils/luxon";

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
    promoCode: v.union(v.string(), v.null()),
    email: v.string(),
    maleCount: v.number(),
    femaleCount: v.number(),
    paymentMethodId: v.string(),
  },
  handler: async (ctx, args): Promise<InsertTicketSoldResponse> => {
    const {
      eventId,
      promoCode,
      email,
      maleCount,
      femaleCount,
      paymentMethodId,
    } = args;

    try {
      const {
        event,
        ticketInfo,
        stripeAccountId,
        promoDiscount,
        clerkPromoterId,
      } = await ctx.runQuery(internal.events.getEventsWithTickets, {
        eventId,
        promoCode,
      });

      if (!isAfterNowInPacificTime(ticketInfo.ticketSalesEndTime)) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.TICKET_SALES_ENDED,
        };
      }
      const stripeCustomerId = await ctx.runAction(
        api.stripe.getStripeCustomerIdForEmail,
        {
          email,
          stripeAccountId,
        }
      );

      const setupIntent = await stripe.setupIntents.create({
        customer: stripeCustomerId,
      });
      console.log("stripeCustomer", setupIntent);

      const paymentMethod = await stripe.paymentMethods.create(
        {
          customer: stripeCustomerId,
          payment_method: paymentMethodId,
        },
        {
          stripeAccount: stripeAccountId,
        }
      );

      // const paymentMethod = await stripe.paymentMethods.create(
      //   {
      //     customer: stripeCustomerId,
      //     payment_method: paymentMethodId,
      //   },
      //   {
      //     stripeAccount: stripeAccountId,
      //   }
      // );
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });

      // console.log("Stripe Customer ID:", stripeCustomerId);

      let maleTicketTotal = maleCount * ticketInfo.ticketTypes.male.price;
      let femaleTicketTotal = femaleCount * ticketInfo.ticketTypes.female.price;

      maleTicketTotal = Math.max(
        0,
        maleTicketTotal - maleCount * promoDiscount
      );
      femaleTicketTotal = Math.max(
        0,
        femaleTicketTotal - femaleCount * promoDiscount
      );

      let totalPrice = maleTicketTotal + femaleTicketTotal;
      totalPrice = Math.round(totalPrice * 100);

      // const platformCustomer = await stripe.customers.create({
      //   email,
      // });

      // 2. Clone customer to connected account
      // const connectedCustomer = await stripe.customers.create(
      //   {
      //     email,
      //   },
      //   {
      //     stripeAccount: stripeAccountId,
      //   }
      // );
      // const customer = await stripe.customers.create(
      //   {
      //     email: "person@example.com",
      //   },
      //   {
      //     stripeAccount: "{{CONNECTED_ACCOUNT_ID}}",
      //   }
      // );
      // console.log("connected Customer", connectedCustomer.id);

      // const clonedPaymentMethod = await stripe.paymentMethods.create(
      //   {
      //     customer: connectedCustomer.id,
      //     payment_method: paymentMethodId,
      //   },
      //   {
      //     stripeAccount: stripeAccountId,
      //   }
      // );

      // console.log("cloned", clonedPaymentMethod);

      // await stripe.paymentMethods.attach(paymentMethodId, {
      //   customer: stripeCustomerId, // Must be a customer in the connected account
      // });
      // Ensure the customer exists in the connected account

      // ✅ Make sure PaymentMethod is attached in the connected Stripe account
      // await stripe.paymentMethods.attach(paymentMethodId, {
      //   customer: stripeCustomerId,
      // }); // ✅ Pass stripeAccountId to ensure it's inside the correct account

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: totalPrice,
          currency: USD_CURRENCY,
          confirm: true, // C harge immediately
          off_session: true,
          metadata: {
            eventId,
            email,
            promoCode,
            maleCount,
            femaleCount,
            stripeProductId: ticketInfo.stripeProductId,
            stripeMalePriceId: ticketInfo.ticketTypes.male.stripePriceId,
            stripeFemalePriceId: ticketInfo.ticketTypes.female.stripePriceId,
            promoDiscount,
          },
        },
        { stripeAccount: stripeAccountId }
      );

      if (!paymentIntent.client_secret) {
        console.error(
          "Stripe paymentIntent missing client_secret:",
          paymentIntent
        );
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.PAYMENT_PROCESSING_FAILED,
        };
      }

      if (paymentIntent.status !== "succeeded") {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.PAYMENT_FAILED,
        };
      }

      await ctx.runMutation(internal.connectedPayments.insertConnectedPayment, {
        eventId,
        stripePaymentIntentId: paymentIntent.id,
        email,
        totalAmount: totalPrice,
        promoCode: promoCode,
        maleCount,
        femaleCount,
        status: paymentIntent.status,
      });

      const shortEventId = event._id.slice(0, 4);
      const tickets: CustomerTicket[] = [];

      const createCustomerTicket = (ticket: TicketSchema): CustomerTicket => ({
        ...ticket,
        name: event.name,
        startTime: event.startTime,
        endTime: event.endTime,
        address: event.address,
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
        data: {
          tickets,
          paymentIntent: {
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret,
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
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Moderator,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.id as string;

      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
        .first();

      const validatedUser = validateUser(user);

      const ticket: TicketSchema | null = await ctx.db
        .query("tickets")
        .filter((q) => q.eq(q.field("ticketUniqueId"), args.ticketUniqueId))
        .first();

      if (!ticket) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.TICKET_NOT_FOUND,
        };
      }

      const event: EventSchema | null = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("_id"), ticket.eventId))
        .first();

      const validatedEvent = validateEvent(event);

      isUserInCompanyOfEvent(validatedUser, validatedEvent);

      if (ticket.checkInTime) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: `Ticket already checked in on ${formatUnixToTimeAndShortDate(ticket.checkInTime)}`,
        };
      }

      const now = DateTime.now().toMillis();
      const eventStartTime = DateTime.fromMillis(
        validatedEvent.startTime
      ).toMillis();
      const eventEndTime = DateTime.fromMillis(
        validatedEvent.endTime
      ).toMillis();

      if (now < eventStartTime || now > eventEndTime) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: `Invalid check-in. Ticket is for ${validatedEvent.name} on ${formatToTimeAndShortDate(validatedEvent.startTime)}`,
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
