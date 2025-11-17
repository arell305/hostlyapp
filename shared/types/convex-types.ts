import {
  ErrorMessages,
  StripeAccountStatus,
  ResponseStatus,
} from "@/shared/types/enums";

import {
  ProratedPrice,
  TicketSalesByPromoter,
  TicketSoldCountByType,
  TicketTotalsItem,
  UserWithPromoCode,
} from "@/shared/types/types";
import { Doc, Id } from "@/convex/_generated/dataModel";

export interface ErrorResponse {
  status: typeof ResponseStatus.ERROR;
  data: null;
  error: typeof ErrorMessages.INTERNAL_ERROR | string;
}

export interface CreateOrganizationData {
  organizationId: Id<"organizations">;
  slug: string;
  clerkOrganizationId: string;
}

export interface GetEventByIdData {
  event: Doc<"events">;
  guestListInfo: Doc<"guestListInfo"> | null;
  ticketSoldCounts?: TicketSoldCountByType[] | null;
  ticketTypes: Doc<"eventTicketTypes">[];
}

export type GetOnboardingLinkResponse =
  | GetOnboardingLinkSuccess
  | ErrorResponse;

export interface GetOnboardingLinkSuccess {
  status: typeof ResponseStatus.SUCCESS;
  data: GetOnboardingLinkData;
}

export interface GetOnboardingLinkData {
  client_secret: string;
}

export interface EventWithExtras extends Doc<"events"> {
  guestListInfo: Doc<"guestListInfo"> | null;
  ticketTypes: Doc<"eventTicketTypes">[];
}

export type CreateStripeSubscriptionResponse =
  | CreateStripeSubscriptionSuccess
  | ErrorResponse;

export interface CreateStripeSubscriptionSuccess {
  status: typeof ResponseStatus.SUCCESS;
  data: CreateStripeSubscriptionData | null;
}

export interface CreateStripeSubscriptionData {
  customerId: Id<"customers">;
  subscriptionId: Id<"subscriptions">;
}

export interface GetOrganizationContextData {
  organization: Doc<"organizations">;
  connectedAccountId: string | null;
  connectedAccountStatus: StripeAccountStatus | null;
  subscription: Doc<"subscriptions">;
  availableCredits: number;
  user: UserWithPromoCode;
}

export type GetProratedPricesResponse =
  | GetProratedPricesSuccess
  | ErrorResponse;

export interface GetProratedPricesSuccess {
  status: typeof ResponseStatus.SUCCESS;
  data: GetProratedPricesData;
}

export interface GetProratedPricesData {
  proratedPrices: ProratedPrice[];
}

export type ValidatePromoCodeResponse = {
  isValid: boolean;
  approvedPromoCode: string | null;
  discount: number | null;
};

export type DisconnectStripeActionResponse =
  | DisconnectStripeActionSuccess
  | ErrorResponse;

export interface DisconnectStripeActionSuccess {
  status: typeof ResponseStatus.SUCCESS;
  data: DisconnectStripeActionData;
}

export interface DisconnectStripeActionData {
  connectedAccountId: Id<"connectedAccounts">;
}

export interface GetEventWithTicketsData {
  event: Doc<"events">;
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

export type CreateGuestListCreditPaymentIntentResponse =
  | CreateGuestListCreditPaymentIntentSuccess
  | ErrorResponse;

export interface CreateGuestListCreditPaymentIntentSuccess {
  status: typeof ResponseStatus.SUCCESS;
  data: CreateGuestListCreditPaymentIntentData;
}

export interface CreateGuestListCreditPaymentIntentData {
  clientSecret: string;
}

export type SendContactFormEmailResponse =
  | SendContactFormEmailSuccess
  | ErrorResponse;

export interface SendContactFormEmailSuccess {
  status: typeof ResponseStatus.SUCCESS;
  data: SendContactFormEmailData;
}

export interface SendContactFormEmailData {
  email: string;
  name: string;
  company: string;
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

export interface GetTicketSalesByPromoterData {
  tickets: TicketSalesGroup[];
  ticketTotals: TicketTypeTotal[] | null;
}

export interface TicketSalesGroup {
  promoterId: Id<"users">;
  promoterName: string;
  sales: TicketTypeTotal[];
}

export interface TicketTypeTotal {
  eventTicketTypeId: Id<"eventTicketTypes">;
  name: string;
  count: number;
}

export interface GetEventSummaryData {
  promoterGuestStats: Omit<PromoterGuestStatsData, "entries">[];
  checkInData?: CheckInData;
  tickets: TicketSalesByPromoter[];
  ticketTotals: TicketTotalsItem[] | null;
}
