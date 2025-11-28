import { GenericActionCtx, GenericQueryCtx, UserIdentity } from "convex/server";
import {
  ErrorMessages,
  ShowErrorMessages,
  ResponseStatus,
  UserRole,
} from "@/shared/types/enums";
import { TicketSoldCountByType, TicketType } from "@/shared/types/types";
import { Doc, Id } from "../_generated/dataModel";
import { PLUS_GUEST_LIST_LIMIT, TIME_ZONE } from "@/shared/types/constants";
import { internal } from "../_generated/api";
import { validateSubscription } from "./validation";
import {
  createStripePrices,
  createStripeProduct,
} from "@/convex/functions/stripe";
import { DateTime } from "luxon";
import { ConvexError } from "convex/values";
import { throwConvexError } from "./errors";

export function isUserInOrganization(
  identity: UserIdentity,
  clerkOrgId: string
): boolean {
  const allowedRoles = [UserRole.Hostly_Moderator, UserRole.Hostly_Admin];

  if (
    allowedRoles.includes(
      identity.role as
        | typeof UserRole.Hostly_Moderator
        | typeof UserRole.Hostly_Admin
    )
  ) {
    return true;
  }

  if (identity.clerk_org_id !== clerkOrgId) {
    throw new Error(ErrorMessages.FOBIDDEN_COMPANY);
  }

  return true;
}

export function isUserTheSameAsIdentity(
  identity: UserIdentity,
  clerkUserId: string
): boolean {
  const allowedRoles = [UserRole.Hostly_Moderator, UserRole.Hostly_Admin];

  if (
    allowedRoles.includes(
      identity.role as
        | typeof UserRole.Hostly_Moderator
        | typeof UserRole.Hostly_Admin
    )
  ) {
    return true;
  }

  if (identity.id !== clerkUserId) {
    throwConvexError(ErrorMessages.FOBIDDEN_COMPANY, {
      code: "FORBIDDEN",
      showToUser: true,
    });
  }

  return true;
}

export function isUserThePromoter(
  guestList: Doc<"guestListEntries">,
  user: Doc<"users">
): boolean {
  if (user.role === UserRole.Hostly_Admin || UserRole.Hostly_Moderator) {
    return true;
  }
  if (guestList.userPromoterId !== user._id) {
    throwConvexError(ErrorMessages.PROMOTER_NOT_BELONG_TO_GUEST_LIST, {
      code: "FORBIDDEN",
      showToUser: true,
    });
  }
  return true;
}

export function isUserInCompanyOfEvent(
  user: Doc<"users">,
  event: Doc<"events">
): boolean {
  if (user.role === UserRole.Hostly_Admin || UserRole.Hostly_Moderator) {
    return true;
  }
  if (event.organizationId !== user.organizationId) {
    throwConvexError(ErrorMessages.PROMOTER_NOT_BELONG_TO_COMPANY_OF_EVENT, {
      code: "FORBIDDEN",
      showToUser: true,
    });
  }

  return true;
}

export function shouldExposeError(errorMessage: string): boolean {
  return Object.values(ShowErrorMessages).includes(
    errorMessage as (typeof ShowErrorMessages)[keyof typeof ShowErrorMessages]
  );
}

export async function handleGuestListData(
  ctx: GenericActionCtx<any>,
  organization: Doc<"organizations">,
  eventId: Id<"events">,
  guestListData: {
    guestListCloseTime: number;
    checkInCloseTime: number;
    guestListRules: string;
  },
  userId: Id<"users">
): Promise<Id<"guestListInfo">> {
  const subscription = validateSubscription(
    await ctx.runQuery(
      internal.subscription.getUsableSubscriptionByCustomerId,
      { customerId: organization.customerId }
    )
  );

  const availableGuestListCredits = await ctx.runQuery(
    internal.organizationCredits.getAvailableGuestListCreditsInternal,
    { organizationId: organization._id }
  );

  if (subscription.subscriptionTier === "Standard") {
    if (Number(availableGuestListCredits) >= 0) {
      const [guestListInfoId, _] = await Promise.all([
        ctx.runMutation(internal.guestListInfo.createGuestListInfo, {
          eventId,
          guestListCloseTime: guestListData.guestListCloseTime,
          checkInCloseTime: guestListData.checkInCloseTime,
          guestListRules: guestListData.guestListRules,
        }),
        await ctx.runMutation(
          internal.guestListCreditTransactions.useGuestListCredit,
          {
            organizationId: organization._id,
            userId,
            eventId,
          }
        ),
      ]);
      return guestListInfoId;
    } else {
      throw new Error(ShowErrorMessages.GUEST_LIST_LIMIT_REACHED);
    }
  }

  if (subscription.guestListEventsCount >= PLUS_GUEST_LIST_LIMIT) {
    if (Number(availableGuestListCredits) >= 0) {
      const [guestListInfoId, _] = await Promise.all([
        ctx.runMutation(internal.guestListInfo.createGuestListInfo, {
          eventId,
          guestListCloseTime: guestListData.guestListCloseTime,
          checkInCloseTime: guestListData.checkInCloseTime,
          guestListRules: guestListData.guestListRules,
        }),
        await ctx.runMutation(
          internal.guestListCreditTransactions.useGuestListCredit,
          {
            organizationId: organization._id,
            userId,
            eventId,
          }
        ),
      ]);
      return guestListInfoId;
    } else {
      throw new Error(ShowErrorMessages.GUEST_LIST_LIMIT_REACHED);
    }
  }

  const [guestListInfoId, _] = await Promise.all([
    ctx.runMutation(internal.guestListInfo.createGuestListInfo, {
      eventId,
      guestListCloseTime: guestListData.guestListCloseTime,
      checkInCloseTime: guestListData.checkInCloseTime,
      guestListRules: guestListData.guestListRules,
    }),
    ctx.runMutation(internal.subscription.updateSubscriptionById, {
      subscriptionId: subscription._id,
      updates: {
        guestListEventsCount: subscription.guestListEventsCount + 1,
      },
    }),
  ]);

  return guestListInfoId;
}

export async function handleTicketData(
  ctx: GenericActionCtx<any>,
  eventId: Id<"events">,
  ticketData: TicketType[],
  organization: Doc<"organizations">
): Promise<Id<"eventTicketTypes">[]> {
  const connectedAccount = await ctx.runQuery(
    internal.connectedAccounts.getConnectedAccountByCustomerId,
    { customerId: organization.customerId }
  );

  if (!connectedAccount) {
    throw new Error(ErrorMessages.CONNECTED_ACCOUNT_NOT_FOUND);
  }

  if (connectedAccount.status !== "Verified") {
    throw new Error(ErrorMessages.CONNECTED_ACCOUNT_VERIFIED);
  }

  const eventTicketTypesIds: Id<"eventTicketTypes">[] = [];

  for (const ticket of ticketData) {
    const stripeProductId = await createStripeProduct(
      eventId,
      connectedAccount.stripeAccountId,
      ticket.name
    );

    const stripePriceId = await createStripePrices(
      stripeProductId.id,
      ticket.price,
      ticket.name,
      eventId,
      connectedAccount.stripeAccountId
    );

    const eventTicketTypesId = await ctx.runMutation(
      internal.eventTicketTypes.createEventTicketTypes,
      {
        eventId,
        name: ticket.name,
        price: ticket.price,
        capacity: ticket.capacity,
        stripeProductId: stripeProductId.id,
        stripePriceId: stripePriceId.id,
        ticketSalesEndTime: ticket.ticketSalesEndTime,
        description: ticket.description || null,
      }
    );
    eventTicketTypesIds.push(eventTicketTypesId);
  }

  return eventTicketTypesIds;
}

export async function performAddEventCleanup(
  ctx: GenericActionCtx<any>,
  eventId: Id<"events"> | null,
  eventTicketTypesIds: Id<"eventTicketTypes">[]
): Promise<void> {
  if (eventId) {
    await ctx.runMutation(internal.events.deleteEvent, { eventId });
  }
  if (eventTicketTypesIds.length > 0) {
    await ctx.runMutation(
      internal.eventTicketTypes.internalDeleteEventTicketTypes,
      {
        eventTicketTypesIds,
      }
    );
  }
}

export function handleError(error: unknown): {
  status: typeof ResponseStatus.ERROR;
  data: null;
  error: string;
} {
  const errorMessage =
    error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
  console.error(ErrorMessages.INTERNAL_ERROR, errorMessage, error);

  const isTicketCheckInError =
    errorMessage.includes("Ticket already checked in") ||
    errorMessage.includes("Invalid check-in");

  return {
    status: ResponseStatus.ERROR,
    data: null,
    error:
      isTicketCheckInError || shouldExposeError(errorMessage)
        ? errorMessage
        : ErrorMessages.GENERIC_ERROR,
  };
}

export async function handleGuestListUpdateData(
  ctx: GenericActionCtx<any>,
  organization: Doc<"organizations">,
  eventId: Id<"events">,
  guestListData: {
    guestListCloseTime: number;
    checkInCloseTime: number;
    guestListRules: string;
  } | null,
  userId: Id<"users">
): Promise<Id<"guestListInfo"> | null> {
  const existingGuestListInfo = await ctx.runQuery(
    internal.guestListInfo.getGuestListInfoByEventId,
    { eventId }
  );

  if (!guestListData && !existingGuestListInfo) {
    return null;
  }

  const subscription = validateSubscription(
    await ctx.runQuery(
      internal.subscription.getUsableSubscriptionByCustomerId,
      { customerId: organization.customerId }
    )
  );

  if (guestListData) {
    if (existingGuestListInfo) {
      return await ctx.runMutation(internal.guestListInfo.updateGuestListInfo, {
        guestListInfoId: existingGuestListInfo._id,
        ...guestListData,
      });
    }

    const availableGuestListCredits = await ctx.runQuery(
      internal.organizationCredits.getAvailableGuestListCreditsInternal,
      { organizationId: organization._id }
    );

    if (subscription.subscriptionTier === "Standard") {
      if (Number(availableGuestListCredits) >= 0) {
        const [newGuestListInfoId] = await Promise.all([
          ctx.runMutation(internal.guestListInfo.createGuestListInfo, {
            eventId,
            guestListCloseTime: guestListData.guestListCloseTime,
            checkInCloseTime: guestListData.checkInCloseTime,
            guestListRules: guestListData.guestListRules,
          }),
          await ctx.runMutation(
            internal.guestListCreditTransactions.useGuestListCredit,
            {
              organizationId: organization._id,
              userId,
              eventId,
            }
          ),
        ]);
        return newGuestListInfoId;
      } else {
        throw new Error(ShowErrorMessages.GUEST_LIST_LIMIT_REACHED);
      }
    }

    if (subscription.guestListEventsCount >= PLUS_GUEST_LIST_LIMIT) {
      if (Number(availableGuestListCredits) >= 0) {
        const [newGuestListInfoId] = await Promise.all([
          ctx.runMutation(internal.guestListInfo.createGuestListInfo, {
            eventId,
            guestListCloseTime: guestListData.guestListCloseTime,
            checkInCloseTime: guestListData.checkInCloseTime,
            guestListRules: guestListData.guestListRules,
          }),
          await ctx.runMutation(
            internal.guestListCreditTransactions.useGuestListCredit,
            {
              organizationId: organization._id,
              userId,
              eventId,
            }
          ),
        ]);
        return newGuestListInfoId;
      } else {
        throw new Error(ShowErrorMessages.GUEST_LIST_LIMIT_REACHED);
      }
    }

    const [newGuestListInfoId] = await Promise.all([
      ctx.runMutation(internal.guestListInfo.createGuestListInfo, {
        eventId,
        guestListCloseTime: guestListData.guestListCloseTime,
        checkInCloseTime: guestListData.checkInCloseTime,
        guestListRules: guestListData.guestListRules,
      }),
      ctx.runMutation(internal.subscription.updateSubscriptionById, {
        subscriptionId: subscription._id,
        updates: {
          guestListEventsCount: subscription.guestListEventsCount + 1,
        },
      }),
    ]);
    return newGuestListInfoId;
  }

  return null;
}

export function pricesAreEqual(
  price1: number,
  price2: number,
  tolerance = 0.01
): boolean {
  return Math.abs(price1 - price2) < tolerance;
}

export async function handleTicketUpdateData(
  ctx: GenericActionCtx<any>,
  eventId: Id<"events">,
  ticketData: {
    eventTicketTypeId?: Id<"eventTicketTypes">;
    name: string;
    price: number;
    capacity: number;
    stripeProductId?: string;
    stripePriceId?: string;
    ticketSalesEndTime: number;
    description: string | null;
  }[],
  organization: Doc<"organizations">,
  existingTicketTypes: Doc<"eventTicketTypes">[]
): Promise<Id<"eventTicketTypes">[]> {
  const connectedAccount = await ctx.runQuery(
    internal.connectedAccounts.getConnectedAccountByCustomerId,
    { customerId: organization.customerId }
  );

  if (!connectedAccount || connectedAccount.status !== "Verified") {
    throw new Error(ErrorMessages.CONNECTED_ACCOUNT_NOT_FOUND);
  }

  const now = Date.now();
  const newTicketIds: Id<"eventTicketTypes">[] = [];

  // Track which ticket IDs are still active in the incoming data
  const incomingIds = new Set(
    ticketData
      .map((t) => t.eventTicketTypeId)
      .filter((id): id is Id<"eventTicketTypes"> => !!id)
  );

  // Process each incoming ticket
  for (const ticket of ticketData) {
    if (ticket.eventTicketTypeId && incomingIds.has(ticket.eventTicketTypeId)) {
      // ----- Update existing active ticket -----
      const existing = existingTicketTypes.find(
        (t) => t._id === ticket.eventTicketTypeId && t.isActive
      );

      if (!existing) {
        throw new Error(
          `Active ticket type not found: ${ticket.eventTicketTypeId}`
        );
      }

      await ctx.runMutation(
        internal.eventTicketTypes.internalUpdateEventTicketType,
        {
          eventTicketTypeId: existing._id,
          name: ticket.name,
          price: ticket.price,
          capacity: ticket.capacity,
          ticketSalesEndTime: ticket.ticketSalesEndTime,
          isActive: true,
          description: ticket.description,
        }
      );

      newTicketIds.push(existing._id);
    } else {
      // ----- Create new ticket type -----
      const product = await createStripeProduct(
        eventId,
        connectedAccount.stripeAccountId,
        ticket.name
      );

      const price = await createStripePrices(
        product.id,
        ticket.price,
        ticket.name,
        eventId,
        connectedAccount.stripeAccountId
      );

      const ticketTypeId = await ctx.runMutation(
        internal.eventTicketTypes.createEventTicketTypes,
        {
          eventId,
          name: ticket.name,
          price: ticket.price,
          capacity: ticket.capacity,
          stripeProductId: product.id,
          stripePriceId: price.id,
          ticketSalesEndTime: ticket.ticketSalesEndTime,
          description: ticket.description,
        }
      );

      newTicketIds.push(ticketTypeId);
    }
  }

  // ----- Deactivate removed ticket types -----
  const toDeactivate = existingTicketTypes.filter(
    (t) => t.isActive && !incomingIds.has(t._id)
  );

  for (const ticket of toDeactivate) {
    console.log("Deactivating removed ticket:", ticket.name, ticket._id);

    await ctx.runMutation(
      internal.eventTicketTypes.internalUpdateEventTicketType,
      {
        eventTicketTypeId: ticket._id,
        isActive: false,
        activeUntil: now, // optional: track when it was deactivated
      }
    );
  }

  return newTicketIds;
}

export function calculateDiscount(
  originalAmount: number,
  discountPercentage: number
): number {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error("Discount percentage must be between 0 and 100.");
  }
  const discountFactor = (100 - discountPercentage) / 100;
  return originalAmount * discountFactor;
}
export interface GetTicketSoldCountsResponse {
  ticketSoldCounts: TicketSoldCountByType[];
  ticketTypes: Doc<"eventTicketTypes">[];
}

export async function getTicketSoldCounts(
  ctx: GenericQueryCtx<any>,
  eventId: Id<"events">
): Promise<GetTicketSoldCountsResponse> {
  const [tickets, ticketTypes] = await Promise.all([
    ctx.db
      .query("tickets")
      .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
      .collect(),
    ctx.db
      .query("eventTicketTypes")
      .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
      .collect(),
  ]);

  const countMap = new Map<Id<"eventTicketTypes">, number>();

  for (const ticket of tickets) {
    const typeId = ticket.eventTicketTypeId;
    countMap.set(typeId, (countMap.get(typeId) || 0) + 1);
  }

  const ticketSoldCounts = ticketTypes.map((type) => ({
    eventTicketTypeId: type._id,
    name: type.name,
    count: countMap.get(type._id) || 0,
  }));

  return {
    ticketSoldCounts,
    ticketTypes,
  };
}

interface ValidateTicketAvailabilityArgs {
  ctx: GenericActionCtx<any>;
  eventId: Id<"events">;
  requestedTicketTypes: {
    eventTicketTypeId: Id<"eventTicketTypes">;
    quantity: number;
  }[];
}

export async function validateTicketAvailability({
  ctx,
  eventId,
  requestedTicketTypes,
}: ValidateTicketAvailabilityArgs): Promise<void> {
  const ticketTypes = await ctx.runQuery(
    internal.eventTicketTypes.internalGetEventTicketTypesByEventId,
    { eventId }
  );

  const ticketTypeMap = new Map(ticketTypes.map((t) => [t._id, t]));

  const soldTickets = await ctx.runQuery(
    internal.tickets.internalGetTicketsByEventId,
    { eventId }
  );

  const soldCounts = new Map<Id<"eventTicketTypes">, number>();
  for (const ticket of soldTickets) {
    const current = soldCounts.get(ticket.eventTicketTypeId) || 0;
    soldCounts.set(ticket.eventTicketTypeId, current + 1);
  }

  for (const { eventTicketTypeId, quantity } of requestedTicketTypes) {
    const ticketType = ticketTypeMap.get(eventTicketTypeId);
    if (!ticketType) {
      throw new Error(ErrorMessages.EVENT_TICKET_TYPE_NOT_FOUND);
    }

    const sold = soldCounts.get(eventTicketTypeId) || 0;
    const remaining = ticketType.capacity - sold;

    if (quantity > remaining) {
      throw new Error(
        `Not enough tickets available for ${ticketType.name}. Only ${remaining} left.`
      );
    }
  }
}

export async function getActingClerkUserId(
  ctx: GenericActionCtx<any>,
  identity: UserIdentity,
  organizationId: Id<"organizations">
): Promise<string> {
  if (
    identity.role === UserRole.Hostly_Admin ||
    identity.role === UserRole.Hostly_Moderator
  ) {
    const adminUser = await ctx.runQuery(
      internal.organizations.getAdminByOrganizationInternal,
      { organizationId }
    );

    if (!adminUser) {
      throw new Error(ErrorMessages.COMPANY_NO_ADMIN_FOUND);
    }

    if (!adminUser.clerkUserId) {
      throw new Error(ErrorMessages.CLERK_USER_NO_CLERK_ID);
    }

    return adminUser.clerkUserId;
  }

  return identity.id as string;
}

export function hasTicketDataChanged(
  existingTickets: Doc<"eventTicketTypes">[],
  newTickets: {
    name: string;
    price: number;
    capacity: number;
    ticketSalesEndTime: number;
    description: string | null;
  }[]
): boolean {
  if (existingTickets.length !== newTickets.length) return true;

  const sortedExisting = [...existingTickets].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const sortedNew = [...newTickets].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return sortedExisting.some((existing, i) => {
    const incoming = sortedNew[i];
    return (
      existing.name !== incoming.name ||
      !pricesAreEqual(existing.price, incoming.price) || // Use tolerant comparison here
      existing.capacity !== incoming.capacity ||
      existing.ticketSalesEndTime !== incoming.ticketSalesEndTime ||
      existing.description !== incoming.description
    );
  });
}

const DAY_FMT = "LLLL dd, yyyy"; // e.g., February 02, 2025
const TIME_FMT = "h:mm a"; // e.g., 9:00 PM

export function withFormattedTimes<
  T extends {
    startTime: number;
    endTime: number;
  },
>(ticket: T) {
  const start = DateTime.fromMillis(ticket.startTime).setZone(TIME_ZONE);
  const end = DateTime.fromMillis(ticket.endTime).setZone(TIME_ZONE);

  return {
    ...ticket,
    startDay: start.toFormat(DAY_FMT),
    startHour: start.toFormat(TIME_FMT),
    endHour: end.toFormat(TIME_FMT),
  };
}

export function pickDefined<T extends Record<string, unknown>>(source: {
  [K in keyof T]?: T[K] | undefined;
}): Partial<T> {
  return (Object.entries(source) as [keyof T, T[keyof T] | undefined][]).reduce<
    Partial<T>
  >((accumulator, [key, value]) => {
    if (value !== undefined) {
      accumulator[key] = value as T[keyof T];
    }
    return accumulator;
  }, {});
}

export function isEmptyObject(value: object): void {
  if (Object.keys(value).length === 0) {
    throw new Error(ErrorMessages.NO_FIELDS_PROVIDED_TO_UPDATE);
  }
}
