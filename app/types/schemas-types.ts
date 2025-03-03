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

interface OrganizationsSchema {
  _id: Id<"organizations">;
  _creationTime: number;
  clerkOrganizationId: string;
  name: string;
  clerkUserIds: string[];
  imageUrl?: string;
  eventIds: Id<"events">[];
  customerId: Id<"customers">;
  promoDiscount: number;
  isActive?: boolean;
  slug: string;
}

export interface TicketSchema {
  _id: Id<"tickets">;
  eventId: Id<"events">;
  userPromoterId: Id<"users"> | null;
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

export interface CustomerSchema {
  _id: Id<"customers">;
  _creationTime: number;
  stripeCustomerId: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndDate?: string | null;
  stripeSubscriptionId: string;
  email: string;
  paymentMethodId: string;
  subscriptionTier: SubscriptionTier;
  nextPayment: string | null;
  cancelAt: string | null;
  subscriptionStartDate: string;
  isActive?: boolean;
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
