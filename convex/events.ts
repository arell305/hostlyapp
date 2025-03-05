import { v } from "convex/values";
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
  GuestListNameSchema,
  GuestListSchema,
  OrganizationsSchema,
  Promoters,
} from "@/types/types";
import {
  ResponseStatus,
  StripeAccountStatus,
  SubscriptionTier,
  UserRole,
} from "../utils/enum";
import { ErrorMessages, Gender } from "@/types/enums";
import { Id } from "./_generated/dataModel";
import { PaginationResult, paginationOptsValidator } from "convex/server";
import {
  AddEventResponse,
  GetEventByIdResponse,
  UpdateEventResponse,
  GetEventWithGuestListsResponse,
  UpdateGuestAttendanceResponse,
  GetEventsBySlugAndMonthResponse,
  GetEventsByOrganizationPublicResponse,
} from "@/types/convex-types";
import { USD_CURRENCY } from "@/types/constants";
import {
  EventSchema,
  GuestListInfoSchema,
  PromoterPromoCodeSchema,
  TicketInfoSchema,
  UserSchema,
} from "@/types/schemas-types";
import { getCurrentTime } from "../utils/luxon";
import { api, internal } from "./_generated/api";
import { GetEventWithTicketsData } from "@/types/convex/internal-types";
import { stripe } from "./backendUtils/stripe";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateCustomer,
  validateEvent,
  validateGuestList,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import {
  isUserInCompanyOfEvent,
  isUserInOrganization,
} from "./backendUtils/helper";

export const addEvent = action({
  args: {
    slug: v.string(),
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
      slug,
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
      const idenitity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const organization = await ctx.runQuery(
        internal.organizations.getOrganizationBySlug,
        {
          slug,
        }
      );

      const validatedOrganization = validateOrganization(organization, true);

      isUserInOrganization(
        idenitity,
        validatedOrganization.clerkOrganizationId
      );

      const eventId: Id<"events"> = await ctx.runMutation(
        internal.events.createEvent,
        {
          organizationId: validatedOrganization._id,
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
          { customerId: validatedOrganization.customerId }
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
        const customer = await ctx.runQuery(
          internal.customers.findCustomerById,
          { customerId: validatedOrganization.customerId }
        );

        const validatedCustomer = validateCustomer(customer);

        if (
          validatedCustomer.subscriptionTier === SubscriptionTier.ELITE ||
          validatedCustomer.subscriptionTier === SubscriptionTier.PLUS
        ) {
          guestListInfoId = await ctx.runMutation(
            internal.guestListInfo.createGuestListInfo,
            {
              eventId,
              guestListCloseTime: guestListData.guestListCloseTime,
              checkInCloseTime: guestListData.checkInCloseTime,
            }
          );
        } else {
          console.log("customer does not have guest list options.");
        }
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
      const organization = await ctx.db.get(event.organizationId);
      const validatedOrganization = validateOrganization(organization);
      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);
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
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Moderator,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.user as string;

      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
        .unique();

      const validatedUser = validateUser(user);

      const event: EventSchema | null = await ctx.db.get(args.eventId);
      const validatedEvent = validateEvent(event);

      isUserInCompanyOfEvent(validatedUser, validatedEvent);

      const guestLists: GuestListSchema[] = await ctx.db
        .query("guestLists")
        .filter((q) => q.eq(q.field("eventId"), eventId))
        .collect();

      const promoterIds: Id<"users">[] = Array.from(
        new Set(guestLists.map((gl) => gl.userPromoterId))
      );
      const promoters: Promoters[] = await Promise.all(
        promoterIds.map(async (promoterId) => {
          const user = await ctx.db.get(promoterId);
          return { id: promoterId, name: user?.name || "Unknown" };
        })
      );
      const promoterMap: Map<string, string> = new Map(
        promoters.map((p) => [p.id, p.name])
      );

      const allGuests: AllGuestSchema[] = guestLists.flatMap((guestList) =>
        guestList.names.map((guest) => ({
          ...guest,
          promoterId: guestList.userPromoterId,
          promoterName: promoterMap.get(guestList.userPromoterId) || "Unknown",
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
          event: validatedEvent,
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
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Moderator,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.user as string;

      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
        .unique();

      const validatedUser = validateUser(user);

      const guestList: GuestListSchema | null = await ctx.db.get(guestListId);
      const validatedGuestList = validateGuestList(guestList);

      const event: EventSchema | null = await ctx.db.get(
        validatedGuestList.eventId
      );
      const validatedEvent = validateEvent(event);

      isUserInCompanyOfEvent(validatedUser, validatedEvent);

      const updatedNames: GuestListNameSchema[] = validatedGuestList.names.map(
        (guest) => {
          if (guest.id === guestId) {
            return {
              ...guest,
              attended,
              malesInGroup,
              femalesInGroup,
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
          error: ErrorMessages.GUEST_NOT_FOUND,
        };
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: { guestListName: updatedGuest },
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

export const updateEvent = action({
  args: {
    slug: v.string(),
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
      slug,
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
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const organization = await ctx.runQuery(
        internal.organizations.getOrganizationBySlug,
        {
          slug,
        }
      );

      const validatedOrganization = validateOrganization(organization, true);

      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

      let ticketInfoId: Id<"ticketInfo"> | null = null;
      let guestListInfoId: Id<"guestListInfo"> | null = null;

      const existingTicketInfo = await ctx.runQuery(
        internal.ticketInfo.getTicketInfoByEventId,
        { eventId }
      );
      if (ticketData) {
        const connectedAccount = await ctx.runQuery(
          internal.connectedAccounts.getConnectedAccountByCustomerId,
          { customerId: validatedOrganization.customerId }
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
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const event: EventSchema | null = await ctx.db.get(eventId);
      const validatedEvent = validateEvent(event, false);

      const organization: OrganizationsSchema | null = await ctx.db.get(
        validatedEvent.organizationId
      );
      const validatedOrganization = validateOrganization(organization);

      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

      await ctx.db.patch(validatedEvent._id, { isActive: false });
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

export const getEventsByOrganizationPublic = query({
  args: {
    slug: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args): Promise<PaginationResult<EventSchema>> => {
    const { slug, paginationOpts } = args;

    const currenTime = getCurrentTime();
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!organization) {
      return {
        page: [],
        isDone: true,
        continueCursor: null,
      } as unknown as PaginationResult<EventSchema>;
    }

    const events: PaginationResult<EventSchema> = await ctx.db
      .query("events")
      .withIndex("by_organizationId_and_startTime", (q) =>
        q.eq("organizationId", organization._id)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.gt(q.field("endTime"), currenTime)
        )
      )
      .order("asc")
      .paginate(paginationOpts);

    return events;
  },
});

export const getEventsBySlugAndMonth = query({
  args: {
    slug: v.string(),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args): Promise<GetEventsBySlugAndMonthResponse> => {
    const { slug, year, month } = args;
    const startDate = new Date(year, month - 2, 1);
    const endDate = new Date(year, month + 1, 0);
    try {
      const identity = await requireAuthenticatedUser(ctx);

      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      const validatedOrganization = validateOrganization(organization);

      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

      const events: EventSchema[] = await ctx.db
        .query("events")
        .filter((q) =>
          q.eq(q.field("organizationId"), validatedOrganization._id)
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
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    startTime: v.number(),
    endTime: v.number(),
    photo: v.union(v.id("_storage"), v.null()),
    address: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"events">> => {
    try {
      const eventId: Id<"events"> = await ctx.db.insert("events", {
        organizationId: args.organizationId,
        name: args.name,
        description: args.description,
        startTime: args.startTime,
        endTime: args.endTime,
        photo: args.photo,
        address: args.address,
        isActive: true,
      });

      return eventId;
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error(ErrorMessages.EVENT_DB_CREATE_ERROR);
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
