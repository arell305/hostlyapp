import { Id } from "../convex/_generated/dataModel";
import {
  ActiveTab,
  ResponseStatus,
  SubscriptionStatus,
  SubscriptionTier,
} from "../utils/enum";

export interface PricingOption {
  id: string;
  tier: SubscriptionTier;
  price: string;
  description: string;
  isFree: boolean;
  priceId: string;
}

export interface Customer {
  _id?: Id<"customers">;
  stripeCustomerId: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndDate?: string | null;
  stripeSubscriptionId: string;
  email: string;
  paymentMethodId: string;
  subscriptionTier: SubscriptionTier;
  nextPayment: string | null;
}

export interface CustomerWithPayment extends Customer {
  brand?: string;
  last4?: string;
  currentSubscriptionAmount?: number;
  discountPercentage?: number;
}

export interface Membership {
  clerkUserId: string | null;
  role: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

export interface PendingInvitationUser {
  clerkInvitationId: string;
  email: string;
  role: string;
}

export interface ClerkOrganization {
  clerkOrganizationId: string;
  name: string;
  imageUrl: string;
  publicMetadata: any; // Adjust this based on your actual metadata structure
}

export interface Tab {
  label: string;
  value: ActiveTab; // Change this to string to allow any value
}

export interface QueryResponse {
  status: ResponseStatus;
  data: any | null;
  error?: string | null;
}

export interface TicketInfo {
  eventId: Id<"events">;
  maleTicketPrice: number;
  femaleTicketPrice: number;
  maleTicketCapacity: number;
  femaleTicketCapacity: number;
  totalMaleTicketsSold: number;
  totalFemaleTicketsSold: number;
  ticketSalesEndTime: string;
}

export type TicketInfoWithoutEventId = Omit<TicketInfo, "eventId">;

export interface GuestListInfo {
  eventId: Id<"events">; // Reference to the event
  guestListCloseTime: string;
  guestListIds: Id<"guestLists">[]; // Array of guest list IDs
}
export type GuestListInfoWithoutEventId = Omit<GuestListInfo, "eventId">;

export interface EventData {
  _id: Id<"events">;
  clerkOrganizationId: string;
  name: string;
  description: string | null;
  startTime: string;
  endTime: string;
  ticketInfoId?: Id<"ticketInfo"> | null; // Optional reference to ticket info
  photo?: Id<"_storage"> | null; // Optional reference to photo storage
  guestListInfoId?: Id<"guestListInfo"> | null; // Optional reference to guest list info
  venue?: {
    venueName?: string;
    address?: string;
  };
}

export interface GetEventByIdResponse {
  status: ResponseStatus;
  data: {
    event: EventData;
    ticketInfo?: TicketInfo | null;
    guestListInfo?: GuestListInfo | null;
  } | null;
  error?: string | null;
}
export interface PromoCodeUsage {
  _id: Id<"promoCodeUsage">; // Unique identifier for the promo code usage
  _creationTime: number; // Timestamp for when the usage was created
  promoCodeId: Id<"promoterPromoCode">; // Reference to the associated promo code
  eventId: Id<"events">; // Reference to the associated event
  clerkPromoterUserId: string; // ID of the promoter using the promo code
  maleUsageCount: number; // Count of male usages
  femaleUsageCount: number; // Count of female usages
}

export interface TotalUsage {
  totalMaleUsage: number;
  totalFemaleUsage: number;
}

export interface GetTotalPromoCodeUsageByEventResponse {
  status: ResponseStatus;
  data: TotalUsage | null;
  error?: string | null;
}

export interface EventFormData {
  eventName: string;
  description: string;
  venueName?: string | null;
  address?: string | null;
  startTime: string;
  endTime: string;
  guestListCloseTime?: string | null;
  photoStorageId?: Id<"_storage"> | null;
  maleTicketPrice?: string | null;
  femaleTicketPrice?: string | null;
  maleTicketCapacity?: string | null;
  femaleTicketCapacity?: string | null;
  ticketSalesEndTime?: string | null;
}

export interface getPromotersByOrganizationResponse {
  status: ResponseStatus;
  data: Promoter[] | null;
  error?: string;
}

export interface Promoter {
  clerkUserId?: string;
  name?: string;
}

export interface PromoCodeUsageData {
  promoterId: string;
  maleUsageCount: number;
  femaleUsageCount: number;
  promoCodeId: Id<"promoterPromoCode"> | null;
}

export interface GetPromoCodeUsageByPromoterAndEventResponse {
  status: ResponseStatus;
  data: PromoCodeUsageData | null;
  error?: string;
}
