import { ErrorMessages } from "@/types/enums";
import { ResponseStatus, SubscriptionTier } from "../../utils/enum";
import {
  ConnectedAccountsSchema,
  CustomerTicket,
  EventSchema,
  GuestListInfoSchema,
  PromoterPromoCodeSchema,
  PromoterPromoCodeWithDiscount,
  TicketInfoSchema,
  TicketSchema,
  TicketSchemaWithPromoter,
  UserSchema,
} from "./schemas-types";
import {
  CustomerSubscriptionInfo,
  CustomerWithPayment,
  Guest,
  GuestListInfo,
  GuestListNameSchema,
  OrganizationDetails,
  OrganizationsSchema,
  Promoter,
  SubscriptionBillingCycle,
  TicketInfo,
  TransformedOrganization,
} from "./types";
import { Id } from "../../convex/_generated/dataModel";
import { PaginationResult } from "convex/server";
import { Organization } from "@clerk/backend";
import Stripe from "stripe";

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

export type GetOrganizationBySlugQueryResponse =
  | GetOrganizationBySlugQuerySuccess
  | ErrorResponse;

export interface GetOrganizationBySlugQuerySuccess {
  status: ResponseStatus.SUCCESS;
  data: GetOrganizationBySlugQueryData;
}

export interface GetOrganizationBySlugQueryData {
  organization: OrganizationsSchema;
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
}

export type InsertTicketSoldResponse = InsertTicketSoldSuccess | ErrorResponse;

export interface InsertTicketSoldSuccess {
  status: ResponseStatus.SUCCESS;
  data: InsertTicketSoldData;
}

export interface InsertTicketSoldData {
  tickets: CustomerTicket[];
  paymentIntent: {
    id: string;
    client_secret: string;
  };
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
  data: GetSubDatesAndGuestEventsCountByDateData;
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

export type GetCustomerDetailsBySlugResponse =
  | GetCustomerDetailsBySlugSuccess
  | ErrorResponse;

export interface GetCustomerDetailsBySlugSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetCustomerDetailsBySlugData | null;
}

export interface GetCustomerDetailsBySlugData {
  customerData: CustomerWithPayment;
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

export type GetCustomerSubscriptionTierBySlugResponse =
  | GetCustomerSubscriptionTierBySlugSuccess
  | ErrorResponse;

export interface GetCustomerSubscriptionTierBySlugSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetCustomerSubscriptionTierBySlugData | null;
}

export interface GetCustomerSubscriptionTierBySlugData {
  customerSubscription: CustomerSubscriptionInfo;
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

export type GetPromotersBySlugResponse =
  | GetPromotersBySlugSuccess
  | ErrorResponse;

export interface GetPromotersBySlugSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetPromotersBySlugData;
}

export interface GetPromotersBySlugData {
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

export type GetEventsBySlugAndMonthResponse =
  | GetEventsBySlugAndMonthSuccess
  | ErrorResponse;

export interface GetEventsBySlugAndMonthSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetEventsBySlugAndMonthData;
}

export interface GetEventsBySlugAndMonthData {
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
  events: PaginationResult<EventSchema>;
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
