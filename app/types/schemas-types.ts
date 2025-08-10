import { Id } from "../../convex/_generated/dataModel";
import {
  StripeAccountStatus,
  SubscriptionTier,
  SubscriptionStatus,
  UserRole,
} from "./enums";

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
export interface UserWithCustomerId extends UserSchema {
  customerId: Id<"customers">;
}

export interface UserWithOrganizationId extends UserSchema {
  organizationId: Id<"organizations">;
}
export interface UserWithClerkId extends UserSchema {
  clerkUserId: string;
}

export interface UserWithOrgAndCustomer extends UserSchema {
  organizationId: Id<"organizations">;
  customerId: Id<"customers">;
}

export interface UserWithOrgAndCustomerAndClerkId extends UserSchema {
  customerId: Id<"customers">;
  organizationId: Id<"organizations">;
  clerkUserId: string;
}

export interface UserWithOrgAndClerkId extends UserSchema {
  organizationId: Id<"organizations">;
  clerkUserId: string;
}

export interface TicketSchema {
  _id: Id<"tickets">;
  eventId: Id<"events">;
  promoterUserId: Id<"users"> | null;
  email: string;
  eventTicketTypeId: Id<"eventTicketTypes">;
  checkInTime?: number;
  ticketUniqueId: string;
  connectedPaymentId?: Id<"connectedPayments">;
  _creationTime: number;
  organizationId: Id<"organizations">;
}

export interface CustomerTicket {
  _id: Id<"tickets">;
  _creationTime: number;
  eventId: Id<"events">;
  organizationId: Id<"organizations">;
  eventTicketTypeId: Id<"eventTicketTypes">;
  promoterUserId: Id<"users"> | null;
  email: string;
  ticketUniqueId: string;
  checkInTime?: number;
  eventTicketTypeName: string;

  // Extended fields for display/PDF
  name: string; // Event name
  startTime: number;
  endTime: number;
  address: string;
  connectedPaymentId?: Id<"connectedPayments">;
}

export interface TicketSchemaWithPromoter extends TicketSchema {
  promoterName: string | null;
  ticketTypeName: string;
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
  photo: Id<"_storage">;
  address: string;
  isActive: boolean;
}
export interface EventWithTicketTypes extends EventSchema {
  ticketTypes: EventTicketTypesSchema[];
}

export interface GuestListInfoSchema {
  _id: Id<"guestListInfo">;
  _creationTime: number;
  eventId: Id<"events">;
  guestListCloseTime: number;
  checkInCloseTime: number;
  guestListRules: string;
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

export interface GuestListEntrySchema {
  _id: Id<"guestListEntries">;
  _creationTime: number;
  eventId: Id<"events">;
  userPromoterId?: Id<"users">;
  name: string;
  checkInTime?: number;
  malesInGroup?: number;
  femalesInGroup?: number;
  attended?: boolean;
  phoneNumber?: string | null;
  isActive: boolean;
}

export interface GuestListEntryWithPromoter extends GuestListEntrySchema {
  promoterName: string;
}

export interface OrganizationCreditSchema {
  _id: Id<"organizationCredits">;
  _creationTime: number;
  organizationId: Id<"organizations">;
  totalCredits: number;
  creditsUsed: number;
  lastUpdated: number;
}

export interface EventTicketTypesSchema {
  _id: Id<"eventTicketTypes">;
  _creationTime: number;
  eventId: Id<"events">;
  name: string;
  price: number;
  capacity: number;
  stripeProductId: string;
  stripePriceId: string;
  ticketSalesEndTime: number;
  isActive: boolean;
  activeUntil?: number;
}
