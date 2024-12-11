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

export interface GetEventWithGuestListsResponse {
  status: ResponseStatus;
  data: EventWithGuestListsData | null;
  error?: string | null;
}

export interface EventWithGuestListsData {
  event: EventSchema;
  guests: Guest[];
  totalMales: number;
  totalFemales: number;
}

export interface Guest {
  promoterId: string;
  promoterName: string;
  guestListId: Id<"guestLists">;
  attended?: boolean;
  malesInGroup?: number;
  femalesInGroup?: number;
  checkInTime?: string;
  id: string; // Assuming this is the guest's unique ID
  name: string; // Assuming this is the guest's name
}

export interface EventSchema {
  _id: Id<"events">; // Assuming this is the ID type for events
  clerkOrganizationId: string;
  name: string;
  description: string | null;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  ticketInfoId?: Id<"ticketInfo"> | null;
  photo?: Id<"_storage"> | null;
  guestListInfoId?: Id<"guestListInfo"> | null;
  venue?: VenueSchema; // Define Venue type as needed
}

export interface VenueSchema {
  venueName?: string;
  address?: string;
}

export interface GuestListNameSchema {
  id: string;
  name: string;
  attended?: boolean;
  malesInGroup?: number;
  femalesInGroup?: number;
  checkInTime?: string;
}

export interface GuestListSchema {
  _id: Id<"guestLists">;
  names: GuestListNameSchema[];
  eventId: Id<"events">;
  clerkPromoterId: string;
}

export interface Promoters {
  id: string;
  name: string;
}

export interface AllGuestSchema {
  id: string;
  name: string;
  attended?: boolean;
  malesInGroup?: number;
  femalesInGroup?: number;
  checkInTime?: string;
  promoterId: string;
  promoterName: string;
  guestListId: Id<"guestLists">;
}

export interface UpdateGuestAttendanceResponse {
  status: ResponseStatus;
  data: GuestListNameSchema | null;
  error?: string | null;
}

export interface GetGuestListByPromoterResponse {
  status: ResponseStatus;
  data: PromoterGuests | null;
  error?: string | null;
}
export interface PromoterGuests {
  guestListId: Id<"guestLists">;
  names: GuestListNameSchema[];
}

export interface AddGuestListResponse {
  status: ResponseStatus;
  data: AddGuestListData | null;
  error?: string | null;
}

export interface AddGuestListData {
  guestListId: Id<"guestLists">;
  names: NewGuest[];
}

export interface NewGuest {
  id: string;
  name: string;
}

export interface AddGuestListResponse {
  status: ResponseStatus;
  data: AddGuestListData | null;
  error?: string | null;
}

export interface UpdateGuestNameResponse {
  status: ResponseStatus;
  data: UpdateGuestNameData | null;
  error?: string | null;
}

export interface UpdateGuestNameData {
  guestListId: Id<"guestLists">;
  updatedGuest?: GuestListNameSchema;
}

export interface DeleteGuestNameResponse {
  status: ResponseStatus;
  data: DeleteGuestNameData | null;
  error?: string | null;
}

export interface DeleteGuestNameData {
  guestListId: Id<"guestLists">;
  deletedGuestId: string;
  remainingGuestsCount: number;
}

export interface GuestWithPromoter {
  id: string;
  name: string;
  promoterId?: string;
  guestListId?: Id<"guestLists">;
  promoterName?: string;
  attended?: boolean;
  malesInGroup?: number;
  femalesInGroup?: number;
  checkInTime?: string;
}
