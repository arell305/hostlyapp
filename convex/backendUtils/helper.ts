import { GenericActionCtx, UserIdentity } from "convex/server";
import {
  ResponseStatus,
  StripeAccountStatus,
  SubscriptionTier,
  UserRole,
} from "../../utils/enum";
import { ErrorMessages, ShowErrorMessages } from "@/types/enums";
import { GuestListSchema, OrganizationsSchema } from "@/types/types";
import { EventSchema, UserSchema } from "@/types/schemas-types";
import { Id } from "../_generated/dataModel";
import { PLUS_GUEST_LIST_LIMIT } from "@/types/constants";
import { internal } from "../_generated/api";
import { validateSubscription } from "./validation";
import {
  createStripePrices,
  createStripeProduct,
  deleteStripeProduct,
} from "./stripe";

export function isUserInOrganization(
  identity: UserIdentity,
  clerkOrgId: string
): boolean {
  const allowedRoles = [UserRole.Hostly_Moderator, UserRole.Hostly_Admin];

  if (allowedRoles.includes(identity.role as UserRole)) {
    return true;
  }

  if (identity.clerk_org_id !== clerkOrgId) {
    throw new Error(ErrorMessages.FOBIDDEN_COMPANY);
  }

  return true;
}

export function isUserThePromoter(
  guestList: GuestListSchema,
  user: UserSchema
): boolean {
  if (user.role === UserRole.Hostly_Admin || UserRole.Hostly_Moderator) {
    return true;
  }
  if (guestList.userPromoterId !== user._id) {
    throw new Error(ErrorMessages.PROMOTER_NOT_BELONG_TO_GUEST_LIST);
  }
  return true;
}

export function isUserInCompanyOfEvent(
  user: UserSchema,
  event: EventSchema
): boolean {
  if (user.role === UserRole.Hostly_Admin || UserRole.Hostly_Moderator) {
    return true;
  }
  if (event.organizationId !== user.organizationId) {
    throw new Error(ErrorMessages.PROMOTER_NOT_BELONG_TO_COMPANY_OF_EVENT);
  }

  return true;
}

export const shouldExposeError = (errorMessage: string): boolean => {
  const allowedErrors: string[] = [
    ErrorMessages.CUSTOMER_EXISTING_USER,
    ErrorMessages.DATE_BEFORE_SUBSCRIPTION,
    ShowErrorMessages.FORBIDDEN_TIER,
    ShowErrorMessages.GUEST_LIST_LIMIT_REACHED,
    ShowErrorMessages.SUBSCRIPTION_ACTIVE,
  ];

  return allowedErrors.includes(errorMessage);
};

export async function handleGuestListData(
  ctx: GenericActionCtx<any>,
  organization: OrganizationsSchema,
  eventId: Id<"events">,
  guestListData: {
    guestListCloseTime: number;
    checkInCloseTime: number;
  }
): Promise<Id<"guestListInfo">> {
  const subscription = validateSubscription(
    await ctx.runQuery(
      internal.subscription.getUsableSubscriptionByCustomerId,
      { customerId: organization.customerId }
    )
  );

  if (subscription.subscriptionTier === SubscriptionTier.STANDARD) {
    throw new Error(ShowErrorMessages.FORBIDDEN_TIER);
  }

  if (subscription.guestListEventsCount >= PLUS_GUEST_LIST_LIMIT) {
    throw new Error(ShowErrorMessages.FORBIDDEN_TIER);
  }

  const [guestListInfoId, _] = await Promise.all([
    ctx.runMutation(internal.guestListInfo.createGuestListInfo, {
      eventId,
      guestListCloseTime: guestListData.guestListCloseTime,
      checkInCloseTime: guestListData.checkInCloseTime,
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

interface TicketData {
  maleTicketPrice: number;
  femaleTicketPrice: number;
  maleTicketCapacity: number;
  femaleTicketCapacity: number;
  ticketSalesEndTime: number;
}

export async function handleTicketData(
  ctx: GenericActionCtx<any>,
  eventId: Id<"events">,
  ticketData: TicketData,
  organization: OrganizationsSchema
): Promise<Id<"ticketInfo">> {
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

  if (connectedAccount.status !== StripeAccountStatus.VERIFIED) {
    throw new Error(ErrorMessages.CONNECTED_ACCOUNT_VERIFIED);
  }

  const product = await createStripeProduct(
    eventId,
    ticketSalesEndTime,
    connectedAccount.stripeAccountId
  );

  const { malePrice, femalePrice } = await createStripePrices(
    product.id,
    maleTicketPrice,
    femaleTicketPrice,
    maleTicketCapacity,
    femaleTicketCapacity,
    connectedAccount.stripeAccountId
  );

  const ticketInfoId = await ctx.runMutation(
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

  return ticketInfoId;
}

export async function performAddEventCleanup(
  ctx: GenericActionCtx<any>,
  eventId: Id<"events"> | null,
  ticketInfoId: Id<"ticketInfo"> | null,
  stripeProductId: string | null
): Promise<void> {
  if (eventId) {
    await ctx.runMutation(internal.events.deleteEvent, { eventId });
  }
  if (ticketInfoId) {
    await ctx.runMutation(internal.ticketInfo.deleteTicketInfo, {
      ticketInfoId,
    });
  }
  if (stripeProductId) {
    await deleteStripeProduct(stripeProductId);
  }
}

export function handleError(error: unknown): {
  status: ResponseStatus.ERROR;
  data: null;
  error: string;
} {
  const errorMessage =
    error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
  console.error(ErrorMessages.INTERNAL_ERROR, errorMessage, error);

  return {
    status: ResponseStatus.ERROR,
    data: null,
    error: shouldExposeError(errorMessage)
      ? errorMessage
      : ErrorMessages.GENERIC_ERROR,
  };
}

export async function handleGuestListUpdateData(
  ctx: GenericActionCtx<any>,
  organization: OrganizationsSchema,
  eventId: Id<"events">,
  guestListData: {
    guestListCloseTime: number;
    checkInCloseTime: number;
  } | null
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

  // If guestListData is provided, handle creation or update
  if (guestListData) {
    if (subscription.subscriptionTier === SubscriptionTier.STANDARD) {
      throw new Error(ShowErrorMessages.FORBIDDEN_TIER);
    }

    if (subscription.guestListEventsCount >= PLUS_GUEST_LIST_LIMIT) {
      throw new Error(ShowErrorMessages.FORBIDDEN_TIER);
    }

    if (existingGuestListInfo) {
      return await ctx.runMutation(internal.guestListInfo.updateGuestListInfo, {
        guestListInfoId: existingGuestListInfo._id,
        ...guestListData,
      });
    } else {
      // Create a new guest list and update the subscription count
      const [newGuestListInfoId] = await Promise.all([
        ctx.runMutation(internal.guestListInfo.createGuestListInfo, {
          eventId,
          guestListCloseTime: guestListData.guestListCloseTime,
          checkInCloseTime: guestListData.checkInCloseTime,
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
  }

  return null;
}

export async function handleTicketUpdateData(
  ctx: GenericActionCtx<any>,
  eventId: Id<"events">,
  ticketData: TicketData | null,
  organization: OrganizationsSchema
): Promise<Id<"ticketInfo"> | null> {
  const existingTicketInfo = await ctx.runQuery(
    internal.ticketInfo.getTicketInfoByEventId,
    { eventId }
  );

  if (!ticketData) {
    return null;
  }

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

  if (connectedAccount.status !== StripeAccountStatus.VERIFIED) {
    throw new Error(ErrorMessages.CONNECTED_ACCOUNT_VERIFIED);
  }

  const product = await createStripeProduct(
    eventId,
    ticketSalesEndTime,
    connectedAccount.stripeAccountId
  );

  const { malePrice, femalePrice } = await createStripePrices(
    product.id,
    maleTicketPrice,
    femaleTicketPrice,
    maleTicketCapacity,
    femaleTicketCapacity,
    connectedAccount.stripeAccountId
  );

  if (!existingTicketInfo) {
    return await ctx.runMutation(internal.ticketInfo.createTicketInfo, {
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
    });
  }

  return await ctx.runMutation(internal.ticketInfo.internalUpdateTicketInfo, {
    ticketInfoId: existingTicketInfo._id,
    maleTicketPrice,
    femaleTicketPrice,
    maleTicketCapacity,
    femaleTicketCapacity,
    ticketSalesEndTime,
    stripeMalePriceId: malePrice.id,
    stripeFemalePriceId: femalePrice.id,
  });
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
