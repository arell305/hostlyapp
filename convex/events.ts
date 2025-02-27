import { ConvexError, v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import {
  AllGuestSchema,
  CancelEventResponse,
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
  StripeAccountStatus,
  SubscriptionStatus,
  SubscriptionTier,
  UserRole,
} from "../utils/enum";
import { ErrorMessages, Gender } from "@/types/enums";
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
import { PLUS_GUEST_LIST_LIMIT, USD_CURRENCY } from "@/types/constants";
import { DateTime } from "luxon";
import {
  ConnectedAccountsSchema,
  CustomerSchema,
  EventSchema,
  GuestListInfoSchema,
  PromoterPromoCodeSchema,
  TicketInfoSchema,
  UserSchema,
} from "@/types/schemas-types";
import { getCurrentTime } from "../utils/luxon";
import { api, internal } from "./_generated/api";
import { createStripeProduct } from "./stripe";
import { GetEventWithTicketsData } from "@/types/convex/internal-types";
import { stripe } from "./backendUtils/stripe";

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

// export const addEvent = mutation({
//   args: {
//     clerkOrganizationId: v.string(),
//     name: v.string(),
//     description: v.union(v.string(), v.null()),
//     startTime: v.number(),
//     endTime: v.number(),
//     photo: v.union(v.id("_storage"), v.null()),
//     address: v.string(),
//     ticketData: v.union(
//       v.object({
//         maleTicketPrice: v.number(),
//         femaleTicketPrice: v.number(),
//         maleTicketCapacity: v.number(),
//         femaleTicketCapacity: v.number(),
//         ticketSalesEndTime: v.number(),
//       }),
//       v.null()
//     ),
//     guestListData: v.union(
//       v.object({
//         guestListCloseTime: v.number(),
//         checkInCloseTime: v.number(),
//       }),
//       v.null()
//     ),
//   },
//   handler: async (ctx, args): Promise<AddEventResponse> => {
//     try {
//       const identity = await ctx.auth.getUserIdentity();
//       if (!identity) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.UNAUTHENTICATED,
//         };
//       }
//       const role: UserRole = identity.role as UserRole;
//       if (role !== UserRole.Admin && role !== UserRole.Manager) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.FORBIDDEN,
//         };
//       }

//       if (args.clerkOrganizationId !== identity.clerk_org_id) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.FORBIDDEN,
//         };
//       }

//       const organization: OrganizationsSchema | null = await ctx.db
//         .query("organizations")
//         .withIndex("by_clerkOrganizationId", (q) =>
//           q.eq("clerkOrganizationId", args.clerkOrganizationId)
//         )
//         .first();

//       if (!organization) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }

//       const customer: CustomerSchema | null = await ctx.db
//         .query("customers")
//         .filter((q) => q.eq(q.field("_id"), organization.customerId))
//         .first();

//       if (!customer) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }

//       if (
//         args.guestListData &&
//         customer.subscriptionTier === SubscriptionTier.PLUS
//       ) {
//         const subscriptionStart = moment(customer.subscriptionStartDate);
//         const eventStart = moment(args.startTime);

//         let cycleStart = subscriptionStart.clone();
//         while (cycleStart.add(1, "months").isBefore(eventStart)) {
//           // Intentionally empty; the loop advances cycleStart to the correct month
//         }
//         const cycleEnd = cycleStart.clone().add(1, "months");

//         const events: EventSchema[] = await ctx.db
//         .query("events")
//         .filter((q) => q.eq(q.field("clerkOrganizationId"), organization._id))
//         .filter((q) => q.gte(q.field("startTime"), cycleStart.toMillis()))
//         .filter((q) => q.lte(q.field("startTime"), cycleEnd.toMillis()))
//         .collect();

//         const overLimit = events.length >= PLUS_GUEST_LIST_LIMIT;

//         if (overLimit) {
//           return {
//             status: ResponseStatus.ERROR,
//             data: null,
//             error: `Guest List Events limit of ${PLUS_GUEST_LIST_LIMIT} reached for pay period ${cycleStart.format("MMM D, YYYY")} to ${cycleEnd.format("MMM D, YYYY")}. Unable to add more guest list events during this period.`,
//           };
//         }
//       }

//       const eventId: Id<"events"> = await ctx.db.insert("events", {
//         clerkOrganizationId: args.clerkOrganizationId,
//         name: args.name,
//         description: args.description,
//         startTime: args.startTime,
//         endTime: args.endTime,
//         photo: args.photo,
//         address: args.address,
//         isActive: true,
//       });

//       if (args.ticketData) {
//         const ticketInfoId: Id<"ticketInfo"> = await ctx.db.insert(
//           "ticketInfo",
//           {
//             eventId: eventId,
//             maleTicketPrice: args.ticketData.maleTicketPrice,
//             femaleTicketPrice: args.ticketData.femaleTicketPrice,
//             maleTicketCapacity: args.ticketData.maleTicketCapacity,
//             femaleTicketCapacity: args.ticketData.femaleTicketCapacity,
//             ticketSalesEndTime: args.ticketData.ticketSalesEndTime,
//           }
//         );
//         await ctx.db.patch(eventId, {
//           ticketInfoId,
//         });
//       }

//       if (args.guestListData) {
//         const guestListInfoId: Id<"guestListInfo"> = await ctx.db.insert(
//           "guestListInfo",
//           {
//             eventId: eventId,
//             guestListCloseTime: args.guestListData.guestListCloseTime,
//             checkInCloseTime: args.guestListData.checkInCloseTime,
//             guestListIds: [],
//           }
//         );
//         await ctx.db.patch(eventId, {
//           guestListInfoId,
//         });
//       }

//       await ctx.db.patch(organization._id, {
//         eventIds: [...organization.eventIds, eventId],
//       });

//       return {
//         status: ResponseStatus.SUCCESS,
//         data: {
//           eventId,
//         },
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

// export const addEvent = mutation({
//   args: {
//     clerkOrganizationId: v.string(),
//     name: v.string(),
//     description: v.union(v.string(), v.null()),
//     startTime: v.number(), // Expecting timestamp
//     endTime: v.number(), // Expecting timestamp
//     photo: v.union(v.id("_storage"), v.null()),
//     address: v.string(),
//     ticketData: v.union(
//       v.object({
//         maleTicketPrice: v.number(),
//         femaleTicketPrice: v.number(),
//         maleTicketCapacity: v.number(),
//         femaleTicketCapacity: v.number(),
//         ticketSalesEndTime: v.number(),
//       }),
//       v.null()
//     ),
//     guestListData: v.union(
//       v.object({
//         guestListCloseTime: v.number(),
//         checkInCloseTime: v.number(),
//       }),
//       v.null()
//     ),
//   },
//   handler: async (ctx, args): Promise<AddEventResponse> => {
//     try {
//       const identity = await ctx.auth.getUserIdentity();
//       if (!identity) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.UNAUTHENTICATED,
//         };
//       }

//       const role: UserRole = identity.role as UserRole;
//       if (role !== UserRole.Admin && role !== UserRole.Manager) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.FORBIDDEN,
//         };
//       }

//       if (args.clerkOrganizationId !== identity.clerk_org_id) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.FORBIDDEN,
//         };
//       }

//       const organization: OrganizationsSchema | null = await ctx.db
//         .query("organizations")
//         .withIndex("by_clerkOrganizationId", (q) =>
//           q.eq("clerkOrganizationId", args.clerkOrganizationId)
//         )
//         .first();

//       if (!organization) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }

//       const customer: CustomerSchema | null = await ctx.db
//         .query("customers")
//         .filter((q) => q.eq(q.field("_id"), organization.customerId))
//         .first();

//       if (!customer) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }

//       // Insert the event into the database
//       const eventId: Id<"events"> = await ctx.db.insert("events", {
//         clerkOrganizationId: args.clerkOrganizationId,
//         name: args.name,
//         description: args.description,
//         startTime: args.startTime, // Already a number (timestamp)
//         endTime: args.endTime, // Already a number (timestamp)
//         photo: args.photo,
//         address: args.address,
//         isActive: true,
//       });

//       // Handle ticket data if provided
//       let ticketInfoId: Id<"ticketInfo"> | null = null;
//       if (args.ticketData) {
//         ticketInfoId = await ctx.db.insert("ticketInfo", {
//           eventId,
//           maleTicketPrice: args.ticketData.maleTicketPrice,
//           femaleTicketPrice: args.ticketData.femaleTicketPrice,
//           maleTicketCapacity: args.ticketData.maleTicketCapacity,
//           femaleTicketCapacity: args.ticketData.femaleTicketCapacity,
//           ticketSalesEndTime: args.ticketData.ticketSalesEndTime,
//         });
//         await ctx.db.patch(eventId, {
//           ticketInfoId,
//         });
//       }

//       let guestListInfoId: Id<"guestListInfo"> | null = null;
//       // Handle guest list data if provided
//       if (args.guestListData) {
//         guestListInfoId = await ctx.db.insert("guestListInfo", {
//           eventId,
//           guestListCloseTime: args.guestListData.guestListCloseTime,
//           checkInCloseTime: args.guestListData.checkInCloseTime,
//         });
//         await ctx.db.patch(eventId, {
//           guestListInfoId,
//         });
//       }

//       return {
//         status: ResponseStatus.SUCCESS,
//         data: { eventId, ticketInfoId, guestListInfoId },
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

export const addEvent = action({
  args: {
    companyName: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    startTime: v.number(),
    endTime: v.number(),
    photo: v.union(v.id("_storage"), v.null()),
    address: v.string(),
    ticketData: v.union(
      v.object({
        maleTicketPrice: v.number(),
        femaleTicketPrice: v.number(),
        maleTicketCapacity: v.number(),
        femaleTicketCapacity: v.number(),
        ticketSalesEndTime: v.number(),
      }),
      v.null()
    ),
    guestListData: v.union(
      v.object({
        guestListCloseTime: v.number(),
        checkInCloseTime: v.number(),
      }),
      v.null()
    ),
  },
  handler: async (ctx, args): Promise<AddEventResponse> => {
    const {
      companyName,
      name,
      description,
      startTime,
      endTime,
      photo,
      address,
      ticketData,
      guestListData,
    } = args;

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
          error: ErrorMessages.FORBIDDEN_PERMISSION,
        };
      }
      const organization = await ctx.runQuery(
        internal.organizations.getOrganizationByName,
        {
          companyName,
        }
      );

      if (organization.clerkOrganizationId !== identity.clerk_org_id) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FOBIDDEN_COMPANY,
        };
      }
      const eventId: Id<"events"> = await ctx.runMutation(
        internal.events.createEvent,
        {
          clerkOrganizationId: organization.clerkOrganizationId,
          name,
          description,
          startTime,
          endTime,
          photo,
          address,
        }
      );
      let ticketInfoId: Id<"ticketInfo"> | null = null;
      if (ticketData) {
        const {
          maleTicketPrice,
          femaleTicketPrice,
          maleTicketCapacity,
          femaleTicketCapacity,
          ticketSalesEndTime,
        } = ticketData;
        const connectedAccount = await ctx.runQuery(
          internal.connectedAccounts.getConnectedAccountByCustomerId,
          { customerId: organization.customerId }
        );
        const product = await stripe.products.create(
          {
            name: `Event Ticket - ${eventId}`,
            description: `Tickets for event ${eventId}`,
            metadata: {
              eventId,
              ticketSalesEndTime: ticketSalesEndTime,
            },
          },
          { stripeAccount: connectedAccount.stripeAccountId }
        );
        const [malePrice, femalePrice] = await Promise.all([
          stripe.prices.create(
            {
              unit_amount: ticketData.maleTicketPrice * 100,
              currency: USD_CURRENCY,
              product: product.id,
              metadata: {
                ticketType: Gender.Male,
                capacity: maleTicketCapacity,
              },
            },
            { stripeAccount: connectedAccount.stripeAccountId }
          ),
          stripe.prices.create(
            {
              unit_amount: femaleTicketPrice * 100,
              currency: USD_CURRENCY,
              product: product.id,
              metadata: {
                ticketType: Gender.Female,
                capacity: femaleTicketCapacity,
              },
            },
            { stripeAccount: connectedAccount.stripeAccountId }
          ),
        ]);
        ticketInfoId = await ctx.runMutation(
          internal.ticketInfo.createTicketInfo,
          {
            eventId,
            ticketSalesEndTime,
            stripeProductId: product.id,
            ticketTypes: {
              male: {
                price: maleTicketPrice,
                capacity: maleTicketCapacity,
                stripePriceId: malePrice.id,
              },
              female: {
                price: femaleTicketPrice,
                capacity: femaleTicketCapacity,
                stripePriceId: femalePrice.id,
              },
            },
          }
        );
      }
      let guestListInfoId: Id<"guestListInfo"> | null = null;

      if (guestListData) {
        guestListInfoId = await ctx.runMutation(
          internal.guestListInfo.createGuestListInfo,
          {
            eventId,
            guestListCloseTime: guestListData.guestListCloseTime,
            checkInCloseTime: guestListData.checkInCloseTime,
          }
        );
      }
      return {
        status: ResponseStatus.SUCCESS,
        data: { eventId, ticketInfoId, guestListInfoId },
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
        error: ErrorMessages.EVENT_NOT_FOUND,
      };
    }
    try {
      const event: EventSchema | null = await ctx.db.get(normalizedId);
      if (!event) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.EVENT_NOT_FOUND,
        };
      }
      let ticketInfo: TicketInfoSchema | null = null;
      if (event.ticketInfoId) {
        ticketInfo = await ctx.db
          .query("ticketInfo")
          .filter((q) => q.eq(q.field("eventId"), event._id))
          .first();
      }

      let guestListInfo: GuestListInfoSchema | null = null;
      if (event.guestListInfoId) {
        guestListInfo = await ctx.db
          .query("guestListInfo")
          .filter((q) => q.eq(q.field("eventId"), event._id))
          .first();
      }

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
                guest.checkInTime || (attended ? getCurrentTime() : undefined),
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

// export const updateEvent = mutation({
//   args: {
//     clerkOrganizationId: v.string(),
//     eventId: v.id("events"),
//     name: v.union(v.string(), v.null()),
//     description: v.union(v.string(), v.null()),
//     startTime: v.union(v.number(), v.null()),
//     endTime: v.union(v.number(), v.null()),
//     photo: v.union(v.id("_storage"), v.null()),
//     address: v.union(v.string(), v.null()),
//     ticketData: v.union(
//       v.object({
//         maleTicketPrice: v.number(),
//         femaleTicketPrice: v.number(),
//         maleTicketCapacity: v.number(),
//         femaleTicketCapacity: v.number(),
//         ticketSalesEndTime: v.number(),
//       }),
//       v.null()
//     ),
//     guestListData: v.union(
//       v.object({
//         guestListCloseTime: v.number(),
//         checkInCloseTime: v.number(),
//       }),
//       v.null()
//     ),
//   },
//   handler: async (ctx, args): Promise<UpdateEventResponse> => {
//     try {
//       const identity = await ctx.auth.getUserIdentity();
//       if (!identity) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.UNAUTHENTICATED,
//         };
//       }
//       const role: UserRole = identity.role as UserRole;
//       if (role !== UserRole.Admin && role !== UserRole.Manager) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.FORBIDDEN,
//         };
//       }

//       const event = await ctx.db.get(args.eventId);
//       if (!event) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }

//       if (event.clerkOrganizationId !== identity.clerk_org_id) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.FORBIDDEN,
//         };
//       }
//       const organization: OrganizationsSchema | null = await ctx.db
//         .query("organizations")
//         .withIndex("by_clerkOrganizationId", (q) =>
//           q.eq("clerkOrganizationId", args.clerkOrganizationId)
//         )
//         .first();

//       if (!organization) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }

//       const customer: CustomerSchema | null = await ctx.db
//         .query("customers")
//         .filter((q) => q.eq(q.field("_id"), organization.customerId))
//         .first();

//       if (!customer) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }

//       // if (
//       //   args.guestListData &&
//       //   customer.subscriptionTier === SubscriptionTier.PLUS
//       // ) {
//       //   const subscriptionStart = moment(customer.subscriptionStartDate);
//       //   const eventStart = moment(args.startTime);

//       //   let cycleStart = subscriptionStart.clone();
//       //   while (cycleStart.add(1, "months").isBefore(eventStart)) {
//       //     // Intentionally empty; the loop advances cycleStart to the correct month
//       //   }
//       //   const cycleEnd = cycleStart.clone().add(1, "months");

//       //   const events: EventSchema[] = await ctx.db
//       //     .query("events")
//       //     .filter((q) => q.eq(q.field("clerkOrganizationId"), organization._id))
//       //     .filter((q) => q.gte(q.field("startTime"), cycleStart.toISOString()))
//       //     .filter((q) => q.lte(q.field("startTime"), cycleEnd.toISOString()))
//       //     .collect();

//       //   const overLimit = events.length >= PLUS_GUEST_LIST_LIMIT;

//       //   if (overLimit) {
//       //     return {
//       //       status: ResponseStatus.ERROR,
//       //       data: null,
//       //       error: `Guest List Events limit of ${PLUS_GUEST_LIST_LIMIT} reached for pay period ${cycleStart.format("MMM D, YYYY")} to ${cycleEnd.format("MMM D, YYYY")}. Unable to add more guest list events during this period.`,
//       //     };
//       //   }
//       // }

//       const updatedEventData: Partial<EventSchema> = {};
//       if (args.name) updatedEventData.name = args.name;
//       if (args.description !== null)
//         updatedEventData.description = args.description;
//       if (args.startTime) updatedEventData.startTime = args.startTime;
//       if (args.endTime) updatedEventData.endTime = args.endTime;
//       if (args.photo) updatedEventData.photo = args.photo;
//       if (args.address) updatedEventData.address = args.address;

//       const ticketInfo: TicketInfoSchema | null = await ctx.db
//         .query("ticketInfo")
//         .filter((q) => q.eq(q.field("eventId"), event._id))
//         .first();

//       if (ticketInfo && args.ticketData === null) {
//         await ctx.db.patch(event._id, {
//           ticketInfoId: null,
//         });
//       } else if (ticketInfo && args.ticketData) {
//         await ctx.db.patch(ticketInfo._id, {
//           ...args.ticketData,
//         });
//       } else if (args.ticketData) {
//         const ticketInfoId: Id<"ticketInfo"> = await ctx.db.insert(
//           "ticketInfo",
//           {
//             ...args.ticketData,
//             eventId: event._id,
//           }
//         );
//         await ctx.db.patch(event._id, {
//           ticketInfoId,
//         });
//       }

//       const guestListInfo: GuestListInfoSchema | null = await ctx.db
//         .query("guestListInfo")
//         .filter((q) => q.eq(q.field("eventId"), event._id))
//         .first();

//       if (guestListInfo && args.guestListData === null) {
//         await ctx.db.patch(event._id, {
//           guestListInfoId: null,
//         });
//       } else if (guestListInfo && args.guestListData) {
//         await ctx.db.patch(guestListInfo._id, {
//           ...args.guestListData,
//         });
//       } else if (args.guestListData) {
//         const guestListInfoId: Id<"guestListInfo"> = await ctx.db.insert(
//           "guestListInfo",
//           {
//             ...args.guestListData,
//             eventId: event._id,
//           }
//         );
//         await ctx.db.patch(event._id, {
//           guestListInfoId,
//         });
//       }

//       await ctx.db.patch(event._id, updatedEventData);

//       return {
//         status: ResponseStatus.SUCCESS,
//         data: {
//           eventId: event._id,
//         },
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

export const updateEvent = action({
  args: {
    companyName: v.string(),
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    photo: v.optional(v.union(v.id("_storage"), v.null())),
    address: v.optional(v.string()),
    ticketData: v.union(
      v.object({
        maleTicketPrice: v.number(),
        femaleTicketPrice: v.number(),
        maleTicketCapacity: v.number(),
        femaleTicketCapacity: v.number(),
        ticketSalesEndTime: v.number(),
      }),
      v.null()
    ),
    guestListData: v.union(
      v.object({
        guestListCloseTime: v.number(),
        checkInCloseTime: v.number(),
      }),
      v.null()
    ),
  },
  handler: async (ctx, args): Promise<UpdateEventResponse> => {
    const {
      eventId,
      companyName,
      name,
      description,
      startTime,
      endTime,
      photo,
      address,
      ticketData,
      guestListData,
    } = args;

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

      const role: UserRole = identity.role as UserRole;
      if (
        role !== UserRole.Admin &&
        role !== UserRole.Manager &&
        !isHostlyAdmin
      ) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN_PERMISSION,
        };
      }

      const organization = await ctx.runQuery(
        internal.organizations.getOrganizationByName,
        {
          companyName,
        }
      );

      if (
        organization.clerkOrganizationId !== identity.clerk_org_id &&
        !isHostlyAdmin
      ) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FOBIDDEN_COMPANY,
        };
      }

      let ticketInfoId: Id<"ticketInfo"> | null = null;
      let guestListInfoId: Id<"guestListInfo"> | null = null;

      const existingTicketInfo = await ctx.runQuery(
        internal.ticketInfo.getTicketInfoByEventId,
        { eventId }
      );
      if (ticketData) {
        const connectedAccount = await ctx.runQuery(
          internal.connectedAccounts.getConnectedAccountByCustomerId,
          { customerId: organization.customerId }
        );
        const {
          maleTicketPrice,
          femaleTicketPrice,
          maleTicketCapacity,
          femaleTicketCapacity,
          ticketSalesEndTime,
        } = ticketData;
        if (existingTicketInfo) {
          const { stripeMalePriceId, stripeFemalePriceId } =
            await ctx.runAction(api.stripe.createStripeTicketPrices, {
              stripeAccountId: connectedAccount.stripeAccountId,
              stripeProductId: existingTicketInfo.stripeProductId,
              maleTicketPrice,
              maleTicketCapacity,
              femaleTicketCapacity,
              femaleTicketPrice,
            });
          ticketInfoId = await ctx.runMutation(
            internal.ticketInfo.internalUpdateTicketInfo,
            {
              ticketInfoId: existingTicketInfo._id,
              maleTicketPrice,
              femaleTicketPrice,
              maleTicketCapacity,
              femaleTicketCapacity,
              ticketSalesEndTime,
              stripeMalePriceId,
              stripeFemalePriceId,
            }
          );
        } else {
          const { stripeProductId } = await ctx.runAction(
            api.stripe.createStripeProduct,
            {
              stripeAccountId: connectedAccount.stripeAccountId,
              eventId,
              ticketSalesEndTime,
            }
          );

          const { stripeMalePriceId, stripeFemalePriceId } =
            await ctx.runAction(api.stripe.createStripeTicketPrices, {
              stripeAccountId: connectedAccount.stripeAccountId,
              stripeProductId,
              maleTicketPrice,
              maleTicketCapacity,
              femaleTicketCapacity,
              femaleTicketPrice,
            });

          ticketInfoId = await ctx.runMutation(
            internal.ticketInfo.createTicketInfo,
            {
              eventId,
              ticketSalesEndTime,
              stripeProductId,
              ticketTypes: {
                male: {
                  price: maleTicketPrice,
                  capacity: maleTicketCapacity,
                  stripePriceId: stripeMalePriceId,
                },
                female: {
                  price: femaleTicketPrice,
                  capacity: femaleTicketCapacity,
                  stripePriceId: stripeFemalePriceId,
                },
              },
            }
          );
        }
      }

      const existingGuestListInfo = await ctx.runQuery(
        internal.guestListInfo.getGuestListInfoByEventId,
        { eventId }
      );

      if (existingGuestListInfo && guestListData) {
        guestListInfoId = await ctx.runMutation(
          internal.guestListInfo.updateGuestListInfo,
          {
            guestListInfoId: existingGuestListInfo._id,
            ...guestListData,
          }
        );
      } else if (!existingGuestListInfo && guestListData) {
        guestListInfoId = await ctx.runMutation(
          internal.guestListInfo.createGuestListInfo,
          {
            eventId,
            ...guestListData,
          }
        );
      }

      await ctx.runMutation(internal.events.internalUpdateEvent, {
        eventId,
        name,
        description,
        startTime,
        endTime,
        photo,
        address,
        ticketInfoId: ticketData ? ticketInfoId : null,
        guestListInfoId: guestListData ? guestListInfoId : null,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          eventId,
          ticketInfoId,
          guestListInfoId,
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

export const internalGetEventById = internalQuery({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<EventSchema> => {
    try {
      const { eventId } = args;

      const event = await ctx.db.get(eventId);

      if (!event) {
        throw new Error(ErrorMessages.EVENT_NOT_FOUND);
      }

      if (!event.isActive) {
        throw new Error(ErrorMessages.EVENT_INACTIVE);
      }

      return event;
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      throw new Error("Failed to fetch event");
    }
  },
});

// In your Convex queries file
// export const getEventsByOrgAndMonth = query({
//   args: {
//     clerkOrganizationId: v.string(),
//     year: v.number(),
//     month: v.number(),
//   },
//   handler: async (ctx, args): Promise<GetEventsByOrgAndMonthResponse> => {
//     const { clerkOrganizationId, year, month } = args;
//     const startDate = new Date(year, month - 2, 1);
//     const endDate = new Date(year, month + 1, 0);

//     try {
//       const identity = await ctx.auth.getUserIdentity();
//       if (!identity) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.UNAUTHENTICATED,
//         };
//       }
//       const events: EventSchema[] = await ctx.db
//         .query("events")
//         .filter((q) =>
//           q.eq(q.field("clerkOrganizationId"), clerkOrganizationId)
//         )
//         .filter((q) => q.gte(q.field("startTime"), startDate.toISOString()))
//         .filter((q) => q.lte(q.field("startTime"), endDate.toISOString()))
//         .collect();

//       return {
//         status: ResponseStatus.SUCCESS,
//         data: {
//           eventData: events,
//         },
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

export const getEventsByOrganizationPublic = query({
  args: {
    organizationName: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currenTime = getCurrentTime();
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
          q.gt(q.field("endTime"), currenTime)
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
        .filter((q) =>
          q.eq(q.field("clerkOrganizationId"), organization.clerkOrganizationId)
        )
        .filter((q) => q.gte(q.field("startTime"), startDate.getTime()))
        .filter((q) => q.lte(q.field("startTime"), endDate.getTime()))
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

export const createEvent = internalMutation({
  args: {
    clerkOrganizationId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    startTime: v.number(), // Timestamp
    endTime: v.number(), // Timestamp
    photo: v.union(v.id("_storage"), v.null()),
    address: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"events">> => {
    try {
      const eventId: Id<"events"> = await ctx.db.insert("events", {
        clerkOrganizationId: args.clerkOrganizationId,
        name: args.name,
        description: args.description,
        startTime: args.startTime,
        endTime: args.endTime,
        photo: args.photo,
        address: args.address,
        isActive: true, // Defaulting new events to active
      });

      return eventId;
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error("Failed to create event"); // Re-throw for actions to handle
    }
  },
});

export const internalUpdateEvent = internalMutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    photo: v.optional(v.union(v.id("_storage"), v.null())),
    address: v.optional(v.string()),
    ticketInfoId: v.optional(v.union(v.id("ticketInfo"), v.null())),
    guestListInfoId: v.optional(v.union(v.id("guestListInfo"), v.null())),
  },
  handler: async (ctx, args): Promise<Id<"events">> => {
    const { eventId, ...updateFields } = args;

    try {
      const event = await ctx.db.get(eventId);
      if (!event) {
        throw new Error(ErrorMessages.EVENT_NOT_FOUND);
      }

      if (!event.isActive) {
        throw new Error(ErrorMessages.EVENT_INACTIVE);
      }

      const fieldsToUpdate = Object.fromEntries(
        Object.entries(updateFields).filter(([_, value]) => value !== undefined)
      );

      await ctx.db.patch(eventId, fieldsToUpdate);

      return eventId;
    } catch (error) {
      console.error("Error updating event:", error);
      throw new Error("Failed to update event");
    }
  },
});

// export const countGuestListEvents = query({
//   args: {
//     clerkOrganizationId: v.string(),
//     eventStartTime: v.string(),
//   },
//   handler: async (ctx, args): Promise<CountGuestListsEventsResponse> => {
//     try {
//       const identity = await ctx.auth.getUserIdentity();
//       if (!identity) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.UNAUTHENTICATED,
//         };
//       }

//       const isHostlyAdmin = checkIsHostlyAdmin(identity.role as string);

//       if (
//         args.clerkOrganizationId !== identity.clerk_org_id &&
//         !isHostlyAdmin
//       ) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.FORBIDDEN,
//         };
//       }

//       const organization: OrganizationsSchema | null = await ctx.db
//         .query("organizations")
//         .withIndex("by_clerkOrganizationId", (q) =>
//           q.eq("clerkOrganizationId", args.clerkOrganizationId)
//         )
//         .first();

//       if (!organization) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }

//       const customer: CustomerSchema | null = await ctx.db
//         .query("customers")
//         .filter((q) => q.eq(q.field("_id"), organization.customerId))
//         .first();

//       if (!customer) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }
//       const subscriptionStart = moment(customer.subscriptionStartDate);
//       const eventStart = moment(args.eventStartTime);

//       let cycleStart = subscriptionStart.clone();
//       while (cycleStart.add(1, "months").isBefore(eventStart)) {
//         // Intentionally empty; the loop advances cycleStart to the correct month
//       }
//       const cycleEnd = cycleStart.clone().add(1, "months");

//       const events: EventSchema[] = await ctx.db
//         .query("events")
//         .filter((q) => q.eq(q.field("clerkOrganizationId"), organization._id))
//         .filter((q) => q.gte(q.field("startTime"), cycleStart.toISOString()))
//         .filter((q) => q.lte(q.field("startTime"), cycleEnd.toISOString()))
//         .collect();

//       return {
//         status: ResponseStatus.SUCCESS,
//         data: {
//           countData: {
//             eventsCount: events.length,
//             cycleStart: cycleStart.toISOString(),
//             cycleEnd: cycleEnd.toISOString(),
//           },
//         },
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

export const getEventsWithTickets = internalQuery({
  args: { eventId: v.id("events"), promoCode: v.union(v.string(), v.null()) },
  handler: async (ctx, args): Promise<GetEventWithTicketsData> => {
    const { eventId, promoCode } = args;
    try {
      const event = await ctx.db.get(eventId);
      if (!event) {
        throw new Error(ErrorMessages.EVENT_NOT_FOUND);
      }
      if (!event.isActive) {
        throw new Error(ErrorMessages.EVENT_INACTIVE);
      }
      if (!event.ticketInfoId) {
        throw new Error(ErrorMessages.TICKET_INFO_NOT_FOUND);
      }

      const ticketInfo = await ctx.db.get(event.ticketInfoId);

      if (!ticketInfo) {
        throw new Error(ErrorMessages.TICKET_INFO_NOT_FOUND);
      }

      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_clerkOrganizationId", (q) =>
          q.eq("clerkOrganizationId", event.clerkOrganizationId)
        )
        .first();

      if (!organization) {
        throw new Error(ErrorMessages.COMPANY_NOT_FOUND);
      }

      if (!organization.isActive) {
        throw new Error(ErrorMessages.COMPANY_INACTIVE);
      }

      let promoDiscount: number = 0;
      let clerkPromoterId: string | null = null;

      if (promoCode) {
        const normalizedInputName = promoCode.toLowerCase();
        const promoterPromoCode: PromoterPromoCodeSchema | null = await ctx.db
          .query("promoterPromoCode")
          .withIndex("by_name", (q) => q.eq("name", normalizedInputName))
          .unique();

        if (!promoterPromoCode) {
          throw new Error(ErrorMessages.INVALID_PROMO_CODE);
        }

        const user: UserSchema | null = await ctx.db
          .query("users")
          .withIndex("by_clerkUserId", (q) =>
            q.eq("clerkUserId", promoterPromoCode.clerkPromoterUserId)
          )
          .unique();

        if (!user) {
          throw new Error(ErrorMessages.USER_NOT_FOUND);
        }
        if (!user.clerkOrganizationId) {
          throw new Error(ErrorMessages.USER_NO_COMPANY);
        }
        if (!user.isActive) {
          throw new Error(ErrorMessages.USER_INACTIVE);
        }
        if (!user.clerkUserId) {
          throw new Error(ErrorMessages.USER_INACTIVE);
        }
        if (event.clerkOrganizationId !== user.clerkOrganizationId) {
          throw new Error(ErrorMessages.INVALID_PROMO_CODE);
        }
        promoDiscount = organization.promoDiscount;
        clerkPromoterId = user.clerkUserId;
      }

      const connectedAccount = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) =>
          q.eq("customerId", organization.customerId)
        )
        .first();

      if (!connectedAccount) {
        throw new Error(ErrorMessages.CONNECTED_ACCOUNT_NOT_FOUND);
      }

      if (connectedAccount.status !== StripeAccountStatus.VERIFIED) {
        throw new Error(ErrorMessages.CONNECTED_ACCOUNT_INACTIVE);
      }

      return {
        event,
        ticketInfo,
        stripeAccountId: connectedAccount.stripeAccountId,
        promoDiscount,
        clerkPromoterId,
      };
    } catch (error) {
      console.error(
        "Error fetching event, ticket info, and Stripe account:",
        error
      );
      throw new Error("Failed to fetch event and ticket info.");
    }
  },
});
