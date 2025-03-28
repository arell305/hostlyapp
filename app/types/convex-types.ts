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
  TicketInfoSchema,
  TicketSchemaWithPromoter,
  UserSchema,
  EventWithTicketInfo,
  PromoterPromoCodeWithDiscount,
} from "./schemas-types";
import {
  Guest,
  GuestListNameSchema,
  OrganizationDetails,
  OrganizationPublic,
  Promoter,
  ProratedPrice,
  SubscriptionBillingCycle,
  TicketCounts,
  TicketSoldCounts,
} from "./types";
import { Id } from "../../convex/_generated/dataModel";
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
  clerkUserId: string;
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
  clerkOrgId: string;
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
  ticketInfoId: Id<"ticketInfo"> | null;
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
  ticketInfoId: Id<"ticketInfo"> | null;
}

export type GetEventByIdResponse = GetEventByIdSuccess | ErrorResponse;

export interface GetEventByIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetEventByIdData;
}

export interface GetEventByIdData {
  event: EventSchema;
  ticketInfo: TicketInfoSchema | null;
  guestListInfo?: GuestListInfoSchema | null;
  ticketSoldCounts?: TicketSoldCounts | null;
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
  data: GetStripeDashboardUrlData | null;
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
  clerkOrganizationId: string;
}

export type GetUsersByOrganizationSlugResponse =
  | GetUsersByOrganizationSlugSuccess
  | ErrorResponse;

export interface GetUsersByOrganizationSlugSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetUsersByOrganizationSlugData | null;
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
  data: PromoterGuestsData | null;
}
export interface PromoterGuestsData {
  guestListId: Id<"guestLists">;
  names: GuestListNameSchema[];
}

export type UpdateGuestNameResponse = UpdateGuestNameSuccess | ErrorResponse;

export interface UpdateGuestNameSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateGuestNameData | null;
}

export interface UpdateGuestNameData {
  guestListId: Id<"guestLists">;
  updatedGuest?: GuestListNameSchema;
}

export type AddGuestListResponse = AddGuestListSuccess | ErrorResponse;

export interface AddGuestListSuccess {
  status: ResponseStatus.SUCCESS;
  data: AddGuestListData | null;
}

export interface AddGuestListData {
  guestListId: Id<"guestLists">;
  names: NewGuest[];
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
  data: GetEventWithGuestListsData | null;
}

export interface GetEventWithGuestListsData {
  event: EventSchema;
  guests: Guest[];
  totalMales: number;
  totalFemales: number;
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

export interface GetEventsByMonthData {
  eventData: EventSchema[];
}

export type GetEventsByOrganizationPublicResponse =
  | GetEventsByOrganizationPublicSuccess
  | ErrorResponse;

export interface GetEventsByOrganizationPublicSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetEventsByOrganizationPublicData | null;
}

export interface GetEventsByOrganizationPublicData {
  events: PaginationResult<EventWithTicketInfo>;
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
  promoCodeId: string | null;
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
