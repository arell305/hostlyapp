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
  GuestListInfo,
  OrganizationsSchema,
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

export type DeleteClerkUserResponse = DeleteClerkUserSucess | ErrorResponse;

export interface DeleteClerkUserSucess {
  status: ResponseStatus.SUCCESS;
  data: DeleteClerkUserData;
}
export interface DeleteClerkUserData {
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
  organizations: ListOrganizations[];
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

export type UpdateOrganizationResponse =
  | UpdateOrganizationSuccess
  | ErrorResponse;

export interface UpdateOrganizationSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateOrganizationData;
}

export interface UpdateOrganizationData {
  clerkOrgId: string;
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

export type GetOrganizationByNameQueryResponse =
  | GetOrganizationByNameQuerySuccess
  | ErrorResponse;

export interface GetOrganizationByNameQuerySuccess {
  status: ResponseStatus.SUCCESS;
  data: GetOrganizationByNameQueryData;
}

export interface GetOrganizationByNameQueryData {
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
  data: UpdatePromoterPromoCodeData;
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
  stripeAccountId: string;
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
