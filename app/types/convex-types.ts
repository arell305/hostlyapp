import {
  ErrorMessages,
  StripeAccountStatus,
  ResponseStatus,
  SubscriptionTier,
} from "@/types/enums";
import {
  ConnectedAccountsSchema,
  CustomerSchema,
  CustomerTicket,
  EventSchema,
  GuestListInfoSchema,
  SubscriptionSchema,
  TicketSchemaWithPromoter,
  UserSchema,
  PromoterPromoCodeWithDiscount,
  GuestListEntryWithPromoter,
  GuestListEntrySchema,
  EventTicketTypesSchema,
} from "./schemas-types";
import {
  GuestListNameSchema,
  OrganizationDetails,
  OrganizationPublic,
  Promoter,
  ProratedPrice,
  SubscriptionBillingCycle,
  TicketCounts,
  TicketSalesByPromoter,
  TicketSoldCountByType,
  TicketTotalsItem,
  UserWithPromoCode,
} from "./types";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { PaginationResult } from "convex/server";
import { OrganizationSchema } from "./types";

export interface ErrorResponse {
  status: ResponseStatus.ERROR;
  data: null;
  error: ErrorMessages | string;
}

export type FindUserByClerkIdResponse =
  | FindUserByClerkIdSuccess
  | ErrorResponse;

export interface FindUserByClerkIdData {
  user: UserSchema;
}

export interface FindUserByClerkIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: FindUserByClerkIdData;
}

export type UpdateOrganizationMembershipsResponse =
  | UpdateOrganizationMembershipsSuccess
  | ErrorResponse;

export interface UpdateOrganizationMembershipsSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateOrganizationMembershipsData;
}

export interface UpdateOrganizationMembershipsData {
  userId: Id<"users">;
}

export type GetAllOrganizationsResponse =
  | GetAllOrganizationsSuccess
  | ErrorResponse;

export interface GetAllOrganizationsSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetAllOrganizationsData;
}

export interface GetAllOrganizationsData {
  organizationDetails: OrganizationDetails[];
}

export interface ListOrganizations {
  clerkOrganizationId: string;
  name: string;
  imageUrl?: string;
}

export type CreateOrganizationResponse =
  | CreateOrganizationSuccess
  | ErrorResponse;

export interface CreateOrganizationSuccess {
  status: ResponseStatus.SUCCESS;
  data: CreateOrganizationData;
}

export interface CreateOrganizationData {
  organizationId: Id<"organizations">;
  slug: string;
  clerkOrganizationId: string;
}

export type UpdateOrganizationNameResponse =
  | UpdateOrganizationNameSuccess
  | ErrorResponse;

export interface UpdateOrganizationNameSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateOrganizationNameData;
}

export interface UpdateOrganizationNameData {
  slug: string;
}

export type UpdateOrganizationMetadataResponse =
  | UpdateOrganizationMetadataSuccess
  | ErrorResponse;

export interface UpdateOrganizationMetadataSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateOrganizationMetadataData;
}

export interface UpdateOrganizationMetadataData {
  organizationId: Id<"organizations">;
}

export type GetEventsByOrganizationResponse =
  | GetEventsByOrganizationSuccess
  | ErrorResponse;

export interface GetEventsByOrganizationSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetEventsByOrganizationData;
}

export interface GetEventsByOrganizationData {
  events: PaginationResult<EventSchema>;
}

export type UpdateOrganizationLogoResponse =
  | UpdateOrganizationLogoSuccess
  | ErrorResponse;

export interface UpdateOrganizationLogoSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateOrganizationLogoData;
}

export interface UpdateOrganizationLogoData {
  organizationId: string;
}

export type AddEventResponse = AddEventResponseSuccess | ErrorResponse;

export interface AddEventResponseSuccess {
  status: ResponseStatus.SUCCESS;
  data: AddEventResponseData;
}

export interface AddEventResponseData {
  eventId: Id<"events">;
  guestListInfoId: Id<"guestListInfo"> | null;
}

export type CountGuestListsEventsResponse =
  | CountGuestListsEventsSuccess
  | ErrorResponse;

export interface CountGuestListsEventsSuccess {
  status: ResponseStatus.SUCCESS;
  data: CountGuestListsEventsData;
}

export interface CountGuestListsEventsData {
  countData: {
    eventsCount: number;
    cycleStart: string;
    cycleEnd: string;
  };
}

export type UpdateEventResponse = UpdateEventSuccess | ErrorResponse;

export interface UpdateEventSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateEventData;
}

export interface UpdateEventData {
  eventId: Id<"events">;
  guestListInfoId: Id<"guestListInfo"> | null;
}

export type GetEventByIdResponse = GetEventByIdSuccess | ErrorResponse;

export interface GetEventByIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetEventByIdData;
}

export interface GetEventByIdData {
  event: EventSchema;
  guestListInfo: GuestListInfoSchema | null;
  ticketSoldCounts?: TicketSoldCountByType[] | null;
  ticketTypes: EventTicketTypesSchema[];
}

export type InsertTicketSoldResponse = InsertTicketSoldSuccess | ErrorResponse;

export interface InsertTicketSoldSuccess {
  status: ResponseStatus.SUCCESS;
  data: InsertTicketSoldData;
}

export interface InsertTicketSoldData {
  tickets: CustomerTicket[];
}

export type GetTicketsByEventIdResponse =
  | GetTicketsByEventIdSuccess
  | ErrorResponse;

export interface GetTicketsByEventIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetTicketsByEventIdData;
}

export interface GetTicketsByEventIdData {
  tickets: TicketSchemaWithPromoter[];
}

export type CheckInTicketResponse = CheckInTicketSuccess | ErrorResponse;

export interface CheckInTicketSuccess {
  status: ResponseStatus.SUCCESS;
  data: CheckInTicketData;
}

export interface CheckInTicketData {
  ticketId: Id<"tickets">;
}

export type ValidatePromoterPromoCodeResponse =
  | ValidatePromoterPromoCodeSuccess
  | ErrorResponse;

export interface ValidatePromoterPromoCodeSuccess {
  status: ResponseStatus.SUCCESS;
  data: ValidatePromoterPromoCodeData;
}

export interface ValidatePromoterPromoCodeData {
  promoterPromoCode: PromoterPromoCodeWithDiscount;
}

export type UpdatePromoterPromoCodeResponse =
  | UpdatePromoterPromoCodeSuccess
  | ErrorResponse;

export interface UpdatePromoterPromoCodeSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdatePromoterPromoCodeData | null;
}

export interface UpdatePromoterPromoCodeData {
  promoCodeId: Id<"promoterPromoCode">;
}

export type GetCustomerTierByOrganizationNameResponse =
  | GetCustomerTierByOrganizationNameSuccess
  | ErrorResponse;

export interface GetCustomerTierByOrganizationNameSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetCustomerTierByOrganizationNameData;
}

export interface GetCustomerTierByOrganizationNameData {
  customerTier: SubscriptionTier;
  customerId: Id<"customers">;
}

export type GetSubDatesAndGuestEventsCountByDateResponse =
  | GetSubDatesAndGuestEventsCountByDateSuccess
  | ErrorResponse;

export interface GetSubDatesAndGuestEventsCountByDateSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetSubDatesAndGuestEventsCountByDateData | null;
}

export interface GetSubDatesAndGuestEventsCountByDateData {
  billingCycle: SubscriptionBillingCycle;
}

export type CreateConnectedAccountResponse =
  | CreateConnectedAccountSuccess
  | ErrorResponse;

export interface CreateConnectedAccountSuccess {
  status: ResponseStatus.SUCCESS;
  data: CreateConnectedAccountData;
}

export interface CreateConnectedAccountData {
  connectedAccountId: Id<"connectedAccounts">;
}

export type GetOnboardingLinkResponse =
  | GetOnboardingLinkSuccess
  | ErrorResponse;

export interface GetOnboardingLinkSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetOnboardingLinkData;
}

export interface GetOnboardingLinkData {
  client_secret: string;
}

export type GetConnectedAccountByClerkUserIdResponse =
  | GetConnectedAccountByClerkUserIdSuccess
  | ErrorResponse;

export interface GetConnectedAccountByClerkUserIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetConnectedAccountByClerkUserIdData | null;
}

export interface GetConnectedAccountByClerkUserIdData {
  connectedAccount: ConnectedAccountsSchema;
}

export type GetStripeDashboardUrlResponse =
  | GetStripeDashboardUrlSuccess
  | ErrorResponse;

export interface GetStripeDashboardUrlSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetStripeDashboardUrlData;
}

export interface GetStripeDashboardUrlData {
  url: string;
}

export type UpdateClerkOrganizationPhotoResponse =
  | UpdateClerkOrganizationPhotoSuccess
  | ErrorResponse;

export interface UpdateClerkOrganizationPhotoSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateClerkOrganizationPhotoData | null;
}

export interface UpdateClerkOrganizationPhotoData {
  organizationId: Id<"organizations">;
}

export type GetUsersByOrganizationSlugResponse =
  | GetUsersByOrganizationSlugSuccess
  | ErrorResponse;

export interface GetUsersByOrganizationSlugSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetUsersByOrganizationSlugData;
}

export interface GetUsersByOrganizationSlugData {
  clerkOrganizationId: string;
  users: UserSchema[];
}

export type CreateClerkInvitationResponse =
  | CreateClerkInvitationSuccess
  | ErrorResponse;

export interface CreateClerkInvitationSuccess {
  status: ResponseStatus.SUCCESS;
  data: CreateClerkInvitationData;
}

export interface CreateClerkInvitationData {
  clerkInvitationId: string;
}

export type RevokeOrganizationInvitationResponse =
  | RevokeOrganizationInvitationSuccess
  | ErrorResponse;

export interface RevokeOrganizationInvitationSuccess {
  status: ResponseStatus.SUCCESS;
  data: RevokeOrganizationInvitationData;
}

export interface RevokeOrganizationInvitationData {
  clerkInvitationId: string;
}

export type UpdateUserByClerkIdResponse =
  | UpdateUserByClerkIdSuccess
  | ErrorResponse;

export interface UpdateUserByClerkIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateUserByClerkIdData | null;
}

export interface UpdateUserByClerkIdData {
  clerkUserId: string;
}

export type GetCustomerDetailsResponse =
  | GetCustomerDetailsSuccess
  | ErrorResponse;

export interface GetCustomerDetailsSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetCustomerDetailsData;
}

export interface GetCustomerDetailsData {
  customer: CustomerSchema;
}

export type CancelSubscriptionResponse =
  | CancelSubscriptionSuccess
  | ErrorResponse;

export interface CancelSubscriptionSuccess {
  status: ResponseStatus.SUCCESS;
  data: CancelSubscriptionData | null;
}

export interface CancelSubscriptionData {
  customerId: Id<"customers">;
}

export type ResumeSubscriptionResponse =
  | ResumeSubscriptionSuccess
  | ErrorResponse;

export interface ResumeSubscriptionSuccess {
  status: ResponseStatus.SUCCESS;
  data: ResumeSubscriptionData | null;
}

export interface ResumeSubscriptionData {
  customerId: Id<"customers">;
}

export type UpdateSubscriptionPaymentMethodResponse =
  | UpdateSubscriptionPaymentMethodSuccess
  | ErrorResponse;

export interface UpdateSubscriptionPaymentMethodSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateSubscriptionPaymentMethodData | null;
}

export interface UpdateSubscriptionPaymentMethodData {
  customerId: Id<"customers">;
}

export type UpdateSubscriptionTierResponse =
  | UpdateSubscriptionTierSuccess
  | ErrorResponse;

export interface UpdateSubscriptionTierSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateSubscriptionTierData | null;
}

export interface UpdateSubscriptionTierData {
  customerId: Id<"customers">;
}

export type GetGuestListByPromoterResponse =
  | GetGuestListByPromoterSuccess
  | ErrorResponse;

export interface GetGuestListByPromoterSuccess {
  status: ResponseStatus.SUCCESS;
  data: PromoterGuestsData;
}
export interface PromoterGuestsData {
  guestListId: Id<"guestListEntries"> | null;
  names: GuestListNameSchema[];
  totalCheckedIn: number;
  totalGuests: number;
  totalMalesCheckedIn: number;
  totalFemalesCheckedIn: number;
}

export type UpdateGuestNameResponse = UpdateGuestNameSuccess | ErrorResponse;

export interface UpdateGuestNameSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateGuestNameData | null;
}

export interface UpdateGuestNameData {
  guestListId: Id<"guestListEntries">;
  updatedGuest?: GuestListNameSchema;
}

export type AddGuestListEntryResponse =
  | AddGuestListEntrySuccess
  | ErrorResponse;

export interface AddGuestListEntrySuccess {
  status: ResponseStatus.SUCCESS;
  data: AddGuestListEntryData;
}

export interface AddGuestListEntryData {
  guestEntryIds: Id<"guestListEntries">[];
}

export interface NewGuest {
  id: string;
  name: string;
}

export type GetEventWithGuestListsResponse =
  | GetEventWithGuestListsSuccess
  | ErrorResponse;

export interface GetEventWithGuestListsSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetEventWithGuestListsData;
}

export interface GetEventWithGuestListsData {
  guests: GuestListEntryWithPromoter[];
}

export type UpdateGuestAttendanceResponse =
  | UpdateGuestAttendanceSuccess
  | ErrorResponse;

export interface UpdateGuestAttendanceSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateGuestAttendanceData | null;
}

export interface UpdateGuestAttendanceData {
  guestListName: GuestListNameSchema;
}

export type GetConnectedAccountStatusBySlugResponse =
  | GetConnectedAccountStatusBySlugSuccess
  | ErrorResponse;

export interface GetConnectedAccountStatusBySlugSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetConnectedAccountStatusBySlugData;
}

export interface GetConnectedAccountStatusBySlugData {
  hasVerifiedConnectedAccount: boolean;
}

export type GetPromotersByOrgResponse =
  | GetPromotersByOrgSuccess
  | ErrorResponse;

export interface GetPromotersByOrgSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetPromotersByOrgData;
}

export interface GetPromotersByOrgData {
  promoters: Promoter[];
}

export type GetUserByClerkIdResponse = GetUserByClerkIdSuccess | ErrorResponse;

export interface GetUserByClerkIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetUserByClerkIdData;
}

export interface GetUserByClerkIdData {
  user: UserSchema;
}

export type GetEventsByMonthResponse = GetEventsByMonthSuccess | ErrorResponse;

export interface GetEventsByMonthSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetEventsByMonthData;
}

export interface EventWithExtras extends EventSchema {
  guestListInfo: GuestListInfoSchema | null;
  ticketTypes: EventTicketTypesSchema[];
}

export interface GetEventsByMonthData {
  eventData: EventWithExtras[];
}

export type GetOrganizationImagePublicResponse =
  | GetOrganizationImagePublicSuccess
  | ErrorResponse;

export interface GetOrganizationImagePublicSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetOrganizationImagePublicData | null;
}

export interface GetOrganizationImagePublicData {
  photo: Id<"_storage"> | null;
  name: string;
}

export type CreateStripeSubscriptionResponse =
  | CreateStripeSubscriptionSuccess
  | ErrorResponse;

export interface CreateStripeSubscriptionSuccess {
  status: ResponseStatus.SUCCESS;
  data: CreateStripeSubscriptionData | null;
}

export interface CreateStripeSubscriptionData {
  customerId: Id<"customers">;
  subscriptionId: Id<"subscriptions">;
}

export type GetOrganizationContextResponse =
  | GetOrganizationContextSuccess
  | ErrorResponse;

export interface GetOrganizationContextSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetOrganizationContextData;
}

export interface GetOrganizationContextData {
  organization: OrganizationSchema;
  connectedAccountId: string | null;
  connectedAccountStatus: StripeAccountStatus | null;
  subscription: SubscriptionSchema;
  availableCredits: number;
  user: UserWithPromoCode;
}

export type RetryInvoicePaymentResponse =
  | RetryInvoicePaymentSuccess
  | ErrorResponse;

export interface RetryInvoicePaymentSuccess {
  status: ResponseStatus.SUCCESS;
  data: RetryInvoicePaymentData;
}

export interface RetryInvoicePaymentData {
  invoiceId: string;
}

export type GetProratedPricesResponse =
  | GetProratedPricesSuccess
  | ErrorResponse;

export interface GetProratedPricesSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetProratedPricesData;
}

export interface GetProratedPricesData {
  proratedPrices: ProratedPrice[];
}

export type GetTicketsByClerkUserResponse =
  | GetTicketsByClerkUserSuccess
  | ErrorResponse;

export interface GetTicketsByClerkUserSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetTicketsByClerkUserData;
}

export interface GetTicketsByClerkUserData {
  ticketCounts: TicketCounts;
}

export type GetOrganizationPublicContextResponse =
  | GetOrganizationPublicContextSuccess
  | ErrorResponse;

export interface GetOrganizationPublicContextSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetOrganizationPublicContextData;
}

export interface GetOrganizationPublicContextData {
  organizationPublic: OrganizationPublic;
}

export type UpdateStripeSubscriptionResponse =
  | UpdateStripeSubscriptionSuccess
  | ErrorResponse;

export interface UpdateStripeSubscriptionSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateStripeSubscriptionData;
}

export interface UpdateStripeSubscriptionData {
  customerId: Id<"customers">;
  subscriptionId: Id<"subscriptions">;
  organization: OrganizationSchema;
}

export type ValidatePromoCodeResponse = {
  isValid: boolean;
  approvedPromoCode: string | null;
  discount: number | null;
};

export interface GetOrganizationByIdData {
  organization: OrganizationSchema;
}

export interface GetOrganizationBySlugData {
  organization: OrganizationSchema;
}

export type DisconnectStripeActionResponse =
  | DisconnectStripeActionSuccess
  | ErrorResponse;

export interface DisconnectStripeActionSuccess {
  status: ResponseStatus.SUCCESS;
  data: DisconnectStripeActionData;
}

export interface DisconnectStripeActionData {
  connectedAccountId: Id<"connectedAccounts">;
}

export type CreatePaymentIntentResponse =
  | CreatePaymentIntentSuccess
  | ErrorResponse;

export interface CreatePaymentIntentSuccess {
  status: ResponseStatus.SUCCESS;
  data: CreatePaymentIntentData;
}

export interface CreatePaymentIntentData {
  clientSecret: string;
}

export interface GetEventWithTicketsData {
  event: EventSchema;
  promoterUserId: Id<"users"> | null;
}

export interface WebhookResponse {
  success: boolean;
  error?: string;
}

export interface WebhookHandlerResponse {
  success: boolean;
  error?: string;
}

export type GetTotalRevenueByOrganizationResponse =
  | GetTotalRevenueByOrganizationSuccess
  | ErrorResponse;

export interface GetTotalRevenueByOrganizationSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetTotalRevenueByOrganizationData;
}

export interface GetTotalRevenueByOrganizationData {
  totalRevenue: {
    value: number;
    change: number;
  };
  averageDailyRevenue: {
    value: number;
    change: number;
  };
  totalTicketsSold: {
    value: number;
    change: number;
  };
  averageDailyTicketsSold: {
    value: number;
    change: number;
  };
  revenueByDay: {
    date: string;
    revenue: number;
  }[];
  revenueByEvent: {
    name: string;
    revenue: number;
  }[];
  promoterBreakdown: {
    name: string;
    sales: {
      eventTicketTypeId: Id<"eventTicketTypes">;
      name: string;
      count: number;
    }[];
  }[];
}

export type GetGuestListKpisResponse = GetGuestListKpisSuccess | ErrorResponse;

export interface GetGuestListKpisSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetGuestListKpisData;
}

export interface GetGuestListKpisData {
  avgRsvpPerEvent: {
    value: number;
    change: number;
  };
  avgCheckinsPerEvent: {
    value: number;
    change: number;
  };
  avgCheckinRate: {
    value: number;
    change: number;
  };
  avgCheckinsPerPromoter: {
    value: number;
    change: number;
  };
  eventCheckInData: {
    name: string;
    male: number;
    female: number;
  }[];
  promoterLeaderboard: {
    name: string;
    male: number;
    female: number;
  }[];
}

export type FindUserByIdResponse = FindUserByIdSuccess | ErrorResponse;

export interface FindUserByIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: FindUserByIdData;
}

export interface FindUserByIdData {
  user: UserWithPromoCode;
}

export type UpdateUserByIdResponse = UpdateUserByIdSuccess | ErrorResponse;

export interface UpdateUserByIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateUserByIdData;
}

export interface UpdateUserByIdData {
  userId: Id<"users">;
}

export type CreateStripeOnboardingLinkResponse =
  | CreateStripeOnboardingLinkSuccess
  | ErrorResponse;

export interface CreateStripeOnboardingLinkSuccess {
  status: ResponseStatus.SUCCESS;
  data: CreateStripeOnboardingLinkData;
}

export interface CreateStripeOnboardingLinkData {
  url: string;
}

export type CreateGuestListCreditPaymentIntentResponse =
  | CreateGuestListCreditPaymentIntentSuccess
  | ErrorResponse;

export interface CreateGuestListCreditPaymentIntentSuccess {
  status: ResponseStatus.SUCCESS;
  data: CreateGuestListCreditPaymentIntentData;
}

export interface CreateGuestListCreditPaymentIntentData {
  clientSecret: string;
}

export type SendContactFormEmailResponse =
  | SendContactFormEmailSuccess
  | ErrorResponse;

export interface SendContactFormEmailSuccess {
  status: ResponseStatus.SUCCESS;
  data: SendContactFormEmailData;
}

export interface SendContactFormEmailData {
  email: string;
  name: string;
  company: string;
}

export type GetPromoterTicketKpisResponse =
  | GetPromoterTicketKpisSuccess
  | ErrorResponse;

export interface GetPromoterTicketKpisSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetPromoterTicketKpisData;
}

export interface GetPromoterTicketKpisData {
  totalTickets: {
    value: number;
    change: number;
  };
  avgTicketsPerDay: {
    value: number;
    change: number;
  };
  dailyTicketSales: {
    date: string;
    counts: {
      eventTicketTypeId: Id<"eventTicketTypes">;
      name: string;
      count: number;
    }[];
  }[];
}
export type GetOrganizationByClerkUserIdResponse =
  | GetOrganizationByClerkUserIdSuccess
  | ErrorResponse;

export interface GetOrganizationByClerkUserIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetOrganizationByClerkUserIdData;
}

export interface GetOrganizationByClerkUserIdData {
  organization: OrganizationSchema | null;
}

export type DeleteGuestListEntryResponse =
  | DeleteGuestListEntrySuccess
  | ErrorResponse;

export interface DeleteGuestListEntrySuccess {
  status: ResponseStatus.SUCCESS;
  data: DeleteGuestListEntryData;
}

export interface DeleteGuestListEntryData {
  guestListEntryId: Id<"guestListEntries">;
}

export type UpdateGuestListEntryResponse =
  | UpdateGuestListEntrySuccess
  | ErrorResponse;

export interface UpdateGuestListEntrySuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateGuestListEntryData;
}

export interface UpdateGuestListEntryData {
  guestListEntryId: Id<"guestListEntries">;
}

export type CheckInGuestEntryResponse =
  | CheckInGuestEntrySuccess
  | ErrorResponse;

export interface CheckInGuestEntrySuccess {
  status: ResponseStatus.SUCCESS;
  data: CheckInGuestEntryData;
}

export interface CheckInGuestEntryData {
  guestListEntryId: Id<"guestListEntries">;
}

export type GetGuestsGroupedByPromoterResponse =
  | GetGuestsGroupedByPromoterSuccess
  | ErrorResponse;

export interface GetGuestsGroupedByPromoterSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetGuestsGroupedByPromoterData;
}

export interface GetGuestsGroupedByPromoterData {
  guests: GroupedGuestsByPromoter[];
  totalMales: number;
  totalFemales: number;
  totalGuests: number;
  totalCheckedIn: number;
}

export interface GroupedGuestsByPromoter {
  promoterId: Id<"users">;
  promoterName: string;
  guests: GuestListEntrySchema[];
  totalMales: number;
  totalFemales: number;
}

export type GetPromoterGuestStatsResponse =
  | GetPromoterGuestStatsSuccess
  | ErrorResponse;

export interface GetPromoterGuestStatsSuccess {
  status: ResponseStatus.SUCCESS;
  data: {
    promoterGuestStats: PromoterGuestStatsData[];
    checkInData?: CheckInData;
  };
}

export interface PromoterGuestStatsData {
  promoterId: Id<"users">;
  promoterName: string;
  totalMales: number;
  totalFemales: number;
  totalRSVPs: number;
  totalCheckedIn: number;
}

export interface CheckInData {
  totalCheckedIn: number;
  totalMales: number;
  totalFemales: number;
  totalRSVPs: number;
}

export type GetTicketSalesByPromoterResponse =
  | GetTicketSalesByPromoterSuccess
  | ErrorResponse;

export interface GetTicketSalesByPromoterSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetTicketSalesByPromoterData;
}

export interface GetTicketSalesByPromoterData {
  tickets: TicketSalesGroup[];
  ticketTotals: TicketTypeTotal[] | null;
}

export interface TicketSalesGroup {
  promoterId: Id<"users">;
  promoterName: string;
  sales: TicketTypeTotal[]; // tickets sold by this promoter per ticket type
}

export interface TicketTypeTotal {
  eventTicketTypeId: Id<"eventTicketTypes">;
  name: string;
  count: number;
}

export type GetAvailableGuestListCreditsResponse =
  | GetAvailableGuestListCreditsSuccess
  | ErrorResponse;

export interface GetAvailableGuestListCreditsSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetAvailableGuestListCreditsData;
}

export interface GetAvailableGuestListCreditsData {
  availableCredits: number;
}

export type AddPublicGuestListEntryResponse =
  | AddPublicGuestListEntrySuccess
  | ErrorResponse;

export interface AddPublicGuestListEntrySuccess {
  status: ResponseStatus.SUCCESS;
  data: AddPublicGuestListEntryData;
}
export interface AddPublicGuestListEntryData {
  guestEntryId: Id<"guestListEntries">;
}

export type PublicGetGuestListInfoByEventIdResponse =
  | PublicGetGuestListInfoByEventIdSuccess
  | ErrorResponse;

export interface PublicGetGuestListInfoByEventIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: PublicGetGuestListInfoByEventIdData;
}

export interface PublicGetGuestListInfoByEventIdData {
  guestListInfo: GuestListInfoSchema;
  event: EventSchema;
}

export type GetEventTicketTypesByEventIdResponse =
  | GetEventTicketTypesByEventIdSuccess
  | ErrorResponse;

export interface GetEventTicketTypesByEventIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetEventTicketTypesByEventIdData;
}

export interface GetEventTicketTypesByEventIdData {
  eventTicketType: EventTicketTypesSchema;
}

export type GetTicketTypeBreakdownByClerkUserResponse =
  | GetTicketTypeBreakdownSuccess
  | ErrorResponse;

export interface GetTicketTypeBreakdownSuccess {
  status: ResponseStatus.SUCCESS;
  data: TicketTypeBreakdownData;
}

export type TicketTypeBreakdownData = TicketTypeBreakdown[];

export interface TicketTypeBreakdown {
  eventTicketTypeId: Id<"eventTicketTypes">;
  name: string;
  count: number;
}

export type GetPromoterTicketSalesByTypeResponse =
  | GetPromoterTicketSalesByTypeSuccess
  | ErrorResponse;

export interface GetPromoterTicketSalesByTypeSuccess {
  status: ResponseStatus.SUCCESS;
  data: PromoterTicketSalesByType[];
}

export type PromoterTicketSalesByType = {
  name: string;
  count: number;
};

export type GetEventSummaryResponse = GetEventSummarySuccess | ErrorResponse;

export interface GetEventSummarySuccess {
  status: ResponseStatus.SUCCESS;
  data: GetEventSummaryData;
}

export interface GetEventSummaryData {
  promoterGuestStats: Omit<PromoterGuestStatsData, "entries">[];
  checkInData?: CheckInData;
  tickets: TicketSalesByPromoter[];
  ticketTotals: TicketTotalsItem[] | null;
}

export type GetCompanyFaqResponse = GetCompanyFaqSuccess | ErrorResponse;

export interface GetCompanyFaqSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetCompanyFaqData;
}

export interface GetCompanyFaqData {
  faq: Doc<"faq">[];
}

export type UpdateCompanyFaqResponse = UpdateCompanyFaqSuccess | ErrorResponse;

export interface UpdateCompanyFaqSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateCompanyFaqData;
}

export interface UpdateCompanyFaqData {
  faqId: Id<"faq">;
}

export type GetSmsTemplatesResponse = GetSmsTemplatesSuccess | ErrorResponse;

export interface GetSmsTemplatesSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetSmsTemplatesData;
}

export interface GetSmsTemplatesData {
  smsTemplates: Doc<"smsTemplates">[];
}

export type InsertSmsTemplateResponse =
  | InsertSmsTemplateSuccess
  | ErrorResponse;

export interface InsertSmsTemplateSuccess {
  status: ResponseStatus.SUCCESS;
  data: InsertSmsTemplateData;
}

export interface InsertSmsTemplateData {
  smsTemplateId: Id<"smsTemplates">;
}

export type UpdateSmsTemplateResponse =
  | UpdateSmsTemplateSuccess
  | ErrorResponse;

export interface UpdateSmsTemplateSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateSmsTemplateData;
}

export interface UpdateSmsTemplateData {
  smsTemplateId: Id<"smsTemplates">;
}

export type GetCampaignsResponse = GetCampaignsSuccess | ErrorResponse;

export interface GetCampaignsSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetCampaignsData;
}

export interface GetCampaignsData {
  campaigns: Doc<"campaigns">[];
}

export type InsertCampaignResponse = InsertCampaignSuccess | ErrorResponse;

export interface InsertCampaignSuccess {
  status: ResponseStatus.SUCCESS;
  data: InsertCampaignData;
}

export interface InsertCampaignData {
  campaignId: Id<"campaigns">;
}

export type UpdateCampaignResponse = UpdateCampaignSuccess | ErrorResponse;

export interface UpdateCampaignSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateCampaignData;
}

export interface UpdateCampaignData {
  campaignId: Id<"campaigns">;
}

export type GetGuestsResponse = GetGuestsSuccess | ErrorResponse;

export interface GetGuestsSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetGuestsData;
}

export interface GetGuestsData {
  guests: Doc<"guests">[];
}

export type InsertGuestResponse = InsertGuestSuccess | ErrorResponse;

export interface InsertGuestSuccess {
  status: ResponseStatus.SUCCESS;
  data: InsertGuestData;
}

export interface InsertGuestData {
  guestId: Id<"guests">;
}

export type UpdateGuestResponse = UpdateGuestSuccess | ErrorResponse;

export interface UpdateGuestSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateGuestData;
}

export interface UpdateGuestData {
  guestId: Id<"guests">;
}
