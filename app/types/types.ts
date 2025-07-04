import { Id } from "../../convex/_generated/dataModel";
import {
  ActiveStripeTab,
  ErrorMessages,
  Gender,
  ResponseStatus,
  ActiveTab,
  SubscriptionStatus,
  SubscriptionTier,
  UserRole,
} from "./enums";
import {
  EventSchema,
  EventWithTicketTypes,
  GuestListEntrySchema,
} from "./schemas-types";

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
  publicMetadata: any;
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

export interface GuestListInfo {
  eventId: Id<"events">;
  guestListCloseTime: number;
  checkInCloseTime: number; // Array of guest list IDs
}
export type GuestListInfoWithoutEventId = Omit<GuestListInfo, "eventId">;

export interface EventData {
  _id: Id<"events">;
  clerkOrganizationId: string;
  name: string;
  description: string | null;
  startTime: number;
  endTime: number;
  photo: Id<"_storage"> | null;
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
  promoterUserId: Id<"users">;
  name: string;
}

export interface PromoCodeUsageData {
  promoterUserId: Id<"users">;
  maleUsageCount: number;
  femaleUsageCount: number;
  promoCodeId: Id<"promoterPromoCode"> | null;
}

export interface Guest {
  promoterId: string;
  promoterName: string;
  guestListId: Id<"guestListEntries">;
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
  _id: Id<"guestListEntries">;
  names: GuestListNameSchema[];
  eventId: Id<"events">;
  userPromoterId: Id<"users">;
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
  guestListId: Id<"guestListEntries">;
  phoneNumber?: string;
  eventId: Id<"events">;
}

export interface GuestWithPromoter {
  id: string;
  name: string;
  promoterId?: string;
  guestListId?: Id<"guestListEntries">;
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

export interface OrganizationSchema {
  _id: Id<"organizations">;
  clerkOrganizationId: string;
  name: string;
  photo: Id<"_storage"> | null;
  customerId: Id<"customers">;
  promoDiscount: number;
  isActive: boolean;
  slug: string;
}

export interface EventFormInput {
  name: string;
  description: string | null;
  startTime: number;
  endTime: number;
  photo: Id<"_storage">;
  address: string;
}

export interface GuestListFormInput {
  guestListCloseTime: number;
  checkInCloseTime: number;
  guestListRules: string;
}

export interface UpdateListEventCountResponse {
  status: ResponseStatus;
  data: UpdateGuestListEventCountData | null;
  error?: string | null;
}

export interface UpdateGuestListEventCountData {
  remaingEvents: number;
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
  eventId: Id<"events">;
  promoterUserId: Id<"users"> | null;
  email: string;
  ticketUniqueId: string;
  organizationId: Id<"organizations">;
  eventTicketTypeId: Id<"eventTicketTypes">;
}

export interface SubscriptionBillingCycle {
  startDate: number;
  endDate: number;
  eventCount: number;
}

export type CustomerSubscriptionInfo = {
  subscriptionTier: SubscriptionTier;
  customerId: Id<"customers">;
  nextCycle: string | null;
  status: SubscriptionStatus;
};

export type ModalConfig = {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  error: string | null;
  isLoading: boolean;
  onClose: () => void;
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

export interface ProratedPrice {
  tier: SubscriptionTier;
  proratedAmount: string;
  monthlyAmount: string;
  discountApplied: boolean;
}

export interface TicketCounts {
  male: number;
  female: number;
}

export interface OrganizationPublic {
  name: string;
  photo: Id<"_storage"> | null;
  connectedAccountStripeId?: string | null;
  isStripeEnabled: boolean;
  id: Id<"organizations">;
  events: EventWithTicketTypes[];
}

export interface GuestEntry {
  name: string;
  phoneNumber?: string;
}

export type CalendarValue = Date | null | [Date | null, Date | null];

export interface PromoterGuestSummary {
  promoterId: string;
  promoterName: string;
  entries: GuestListEntrySchema[];
  totalMales: number;
  totalFemales: number;
  totalAttended: number;
  totalGuests: number;
}

export interface TicketSoldCountByType {
  eventTicketTypeId: Id<"eventTicketTypes">;
  name: string;
  count: number;
}

export interface TicketType {
  name: string;
  price: number;
  capacity: number;
  ticketSalesEndTime: number;
}

export type TicketTypeForm = {
  name: string;
  price: string;
  capacity: string;
  ticketSalesEndTime: number | null;
  showCustomInput?: boolean; // Optional for backward compatibility
};

export type TicketUpdateInput = {
  eventTicketTypeId?: Id<"eventTicketTypes">;
  name: string;
  price: number;
  capacity: number;
  stripeProductId?: string;
  stripePriceId?: string;
  ticketSalesEndTime: number;
};
