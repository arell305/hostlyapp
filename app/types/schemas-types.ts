import { Id } from "../../convex/_generated/dataModel";
import {
  StripeAccountStatus,
  SubscriptionStatus,
  SubscriptionTier,
  UserRole,
} from "../../utils/enum";
import { Gender } from "./enums";

export interface UserSchema {
  _id: Id<"users">;
  clerkUserId?: string;
  email: string;
  organizationId?: Id<"organizations">;
  customerId?: Id<"customers">;
  role: UserRole | null;
  name?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface TicketSchema {
  _id: Id<"tickets">;
  eventId: Id<"events">;
  promoterUserId: Id<"users"> | null;
  email: string;
  gender: Gender;
  checkInTime?: number;
  ticketUniqueId: string;
  _creationTime: number;
}

export interface CustomerTicket extends TicketSchema {
  name: string;
  startTime: number;
  endTime: number;
  address: string;
}

export interface TicketSchemaWithPromoter extends TicketSchema {
  promoterName: string | null;
}

export interface PromoterPromoCodeSchema {
  _id: Id<"promoterPromoCode">;
  _creationTime: number;
  name: string;
  promoterUserId: Id<"users">;
}

export interface PromoterPromoCodeWithDiscount extends PromoterPromoCodeSchema {
  promoDiscount: number;
}

export interface EventSchema {
  _id: Id<"events">;
  organizationId: Id<"organizations">;
  name: string;
  description: string | null;
  startTime: number;
  endTime: number;
  photo: Id<"_storage"> | null;
  address: string;
  isActive: boolean;
  ticketInfoId?: Id<"ticketInfo"> | null;
  guestListInfoId?: Id<"guestListInfo"> | null;
}

export interface TicketInfoSchema {
  _id: Id<"ticketInfo">;
  _creationTime: number;
  eventId: Id<"events">;
  ticketSalesEndTime: number;
  stripeProductId: string;
  ticketTypes: {
    male: {
      price: number;
      capacity: number;
      stripePriceId: string;
    };
    female: {
      price: number;
      capacity: number;
      stripePriceId: string;
    };
  };
}

export interface GuestListInfoSchema {
  _id: Id<"guestListInfo">;
  _creationTime: number;
  eventId: Id<"events">;
  guestListCloseTime: number;
  checkInCloseTime: number;
}

export interface ConnectedAccountsSchema {
  _id: Id<"connectedAccounts">;
  _creationTime: number;
  customerId: Id<"customers">;
  stripeAccountId: string;
  status: StripeAccountStatus;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  lastStripeUpdate?: number;
}

export interface SubscriptionSchema {
  _id: Id<"subscriptions">;
  _creationTime: number;
  stripeSubscriptionId: string;
  priceId: string;
  trialEnd: number | null;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  stripeBillingCycleAnchor: number;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier: SubscriptionTier;
  customerId: Id<"customers">;
  guestListEventsCount: number;
  discount?: {
    stripePromoCodeId?: string;
    discountPercentage?: number;
  };
  amount: number;
}

export interface CustomerSchema {
  _id: Id<"customers">;
  _creationTime: number;
  stripeCustomerId: string;
  email: string;
  paymentMethodId: string;
  isActive: boolean;
  cardBrand?: string;
  last4?: string;
}

export interface CustomerWithCompanyName extends CustomerSchema {
  companyName: string;
}

export interface StripeConnectedCustomersSchema {
  _id: Id<"stripeConnectedCustomers">;
  _creationTime: number;
  email: string;
  stripeCustomerId: string;
  stripeAccountId: string;
}
