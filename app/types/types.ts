import { PaymentMethod } from "@stripe/stripe-js";
import { Id } from "../../convex/_generated/dataModel";
import {
  ActiveStripeTab,
  ActiveTab,
  ResponseStatus,
  SubscriptionStatus,
  SubscriptionTier,
  UserRole,
} from "../../utils/enum";
import { ErrorMessages, Gender } from "./enums";
import { EventSchema } from "./schemas-types";

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
  value: ActiveTab | ActiveStripeTab;
}

export interface QueryResponse {
  status: ResponseStatus;
  data: any | null;
  error?: string | null;
}

export interface TicketInfo {
  _id: Id<"ticketInfo">;
  eventId: Id<"events">;
  maleTicketPrice: number;
  femaleTicketPrice: number;
  maleTicketCapacity: number;
  femaleTicketCapacity: number;
  ticketSalesEndTime: number;
}

export type TicketInfoWithoutEventId = Omit<TicketInfo, "eventId">;

export interface GuestListInfo {
  eventId: Id<"events">; // Reference to the event
  guestListCloseTime: number;
  checkInCloseTime: number;
  guestListIds: Id<"guestLists">[]; // Array of guest list IDs
}
export type GuestListInfoWithoutEventId = Omit<GuestListInfo, "eventId">;

export interface EventData {
  _id: Id<"events">;
  clerkOrganizationId: string;
  name: string;
  description: string | null;
  startTime: number;
  endTime: number;
  photo: Id<"_storage"> | null; // Optional reference to photo storage
  address: string;
  isActive: boolean;
}

export interface PromoCodeUsage {
  _id: Id<"promoCodeUsage">;
  _creationTime: number;
  promoCodeId: Id<"promoterPromoCode">;
  eventId: Id<"events">;
  promoterUserId: Id<"users">;
  maleUsageCount: number;
  femaleUsageCount: number;
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
  guestListCloseTime?: number | null;
  photoStorageId?: Id<"_storage"> | null;
  maleTicketPrice?: string | null;
  femaleTicketPrice?: string | null;
  maleTicketCapacity?: string | null;
  femaleTicketCapacity?: string | null;
  ticketSalesEndTime?: number | null;
}
export interface Promoter {
  promoterUserId?: Id<"users">;
  name?: string;
}

export interface PromoCodeUsageData {
  promoterUserId: Id<"users">;
  maleUsageCount: number;
  femaleUsageCount: number;
  promoCodeId: Id<"promoterPromoCode"> | null;
}

export interface GetPromoCodeUsageByPromoterAndEventResponse {
  status: ResponseStatus;
  data: PromoCodeUsageData | null;
  error?: string;
}

export interface Guest {
  promoterId: string;
  promoterName: string;
  guestListId: Id<"guestLists">;
  attended?: boolean;
  malesInGroup?: number;
  femalesInGroup?: number;
  checkInTime?: number;
  id: string;
  name: string;
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
  checkInTime?: number;
}

export interface GuestListSchema {
  _id: Id<"guestLists">;
  names: GuestListNameSchema[];
  eventId: Id<"events">;
  userPromoterId: Id<"users">;
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
  checkInTime?: number;
  promoterId: string;
  promoterName: string;
  guestListId: Id<"guestLists">;
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
  checkInTime?: number;
}

export interface GuestCheckIn {
  id: string;
  name: string;
  malesInGroup?: number;
  femalesInGroup?: number;
}

export interface OrganizationsSchema {
  _id: Id<"organizations">;
  clerkOrganizationId: string;
  name: string;
  photo: Id<"_storage"> | null;
  customerId: Id<"customers">;
  promoDiscount: number;
  isActive?: boolean;
  slug: string;
}

export interface EventFormInput {
  name: string;
  description: string | null;
  startTime: number;
  endTime: number;
  photo: Id<"_storage"> | null;
  address: string; // Replace `Venue` with its actual type definition if needed
}

export interface TicketFormInput {
  maleTicketPrice: number;
  femaleTicketPrice: number;
  maleTicketCapacity: number;
  femaleTicketCapacity: number;
  ticketSalesEndTime: number;
}

export interface GuestListFormInput {
  guestListCloseTime: number;
  checkInCloseTime: number;
}

export interface UpdateListEventCountResponse {
  status: ResponseStatus;
  data: UpdateGuestListEventCountData | null;
  error?: string | null;
}

export interface UpdateGuestListEventCountData {
  remaingEvents: number;
}

export interface UpdateTicketInfoResponse {
  status: ResponseStatus;
  data: UpdateTicketInfoData | null;
  error?: string | null;
}

export interface UpdateTicketInfoData {
  ticketInfoId: Id<"ticketInfo">;
}

export interface UpdateEventFields {
  name?: string;
  description?: string | null;
  startTime?: string;
  endTime?: string;
  photo?: Id<"_storage"> | null;
  ticketInfoId?: Id<"ticketInfo"> | null;
  guestListInfoId?: Id<"guestListInfo"> | null;
  venue?: VenueSchema;
}

export interface CancelEventResponse {
  status: ResponseStatus;
  data: CancelEventData | null;
  error?: string | null;
}

export interface CancelEventData {
  eventId: Id<"events">;
}

export interface GetPendingInvitationListResponse {
  status: ResponseStatus;
  data: GetPendingInvitationListData | null;
  error?: string | null;
}

export interface GetPendingInvitationListData {
  pendingInvitationUsers: PendingInvitationUser[];
}

export type FindUserByClerkIdResponse =
  | FindUserByClerkIdSuccess
  | ErrorResponse;

export interface FindUserByClerkIdData {
  user: UserWithPromoCode;
}

export interface UserSchema {
  _id: Id<"users">;
  clerkUserId?: string;
  email: string;
  organizationId?: Id<"organizations">;
  customerId?: Id<"customers">;
  role: UserRole | null;
  name?: string;
  isActive: boolean;
  imageUrl?: string;
}

export interface UserWithPromoCode extends UserSchema {
  promoCode?: string | null;
  promoCodeId?: Id<"promoterPromoCode">;
}

export interface ErrorResponse {
  status: ResponseStatus.ERROR;
  data: null;
  error: ErrorMessages | string;
}

export interface FindUserByClerkIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: FindUserByClerkIdData;
}

export interface OrganizationPublicMetadata {
  status?: SubscriptionStatus | undefined;
  promoDiscount?: number | undefined;
  tier?: SubscriptionTier | undefined;
}

export interface TransformedOrganization {
  id: string;
  name: string;
  createdBy: string;
  publicMetadata: any | null;
}

export interface TicketInput {
  eventId: Id<"events">; // Assuming eventId is of type Id<"events">
  clerkPromoterId: string | null; // Can be a string or null
  email: string; // Email address as a string
  gender: Gender; // Assuming Gender is an enum or a union type defined elsewhere
  ticketUniqueId: string; // Unique identifier for the ticket
}

export interface SubscriptionBillingCycle {
  startDate: number;
  endDate: number;
  eventCount: number;
}

export type CustomerSubscriptionInfo = {
  subscriptionTier: SubscriptionTier; // Adjust to enum if needed
  customerId: Id<"customers">;
  nextCycle: string | null; // Adjust if it's stored differently
  status: SubscriptionStatus; // Assuming you're using an enum
};

export type ModalConfig = {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  error: string | null;
  isLoading: boolean;
};

export interface AddressValue {
  label: string;
  value: {
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  };
}

export type OrganizationDetails = {
  name: string;
  slug: string;
  organizationId: string;
  photoStorageId: Id<"_storage"> | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionTier: SubscriptionTier | null;
};

export type CompanyDataWithImage = {
  name: string;
  slug: string;
  organizationId: string;
  imageUrl: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionTier: SubscriptionTier | null;
};
