import { Id } from "../../../convex/_generated/dataModel";
import { ResponseStatus } from "../../../utils/enum";
import { ErrorResponse } from "../types";

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

export interface CreateStripeTicketPricesData {
  stripeMalePriceId: string;
  stripeFemalePriceId: string;
}

export interface CreateStripeProductData {
  stripeProductId: string;
}

export type CreatePaymentIntentResponse = CreatePaymentIntentSuccess  | ErrorResponse;

export interface CreatePaymentIntentSuccess {
  status: ResponseStatus.SUCCESS;
  data: CreatePaymentIntentData;
}

export interface CreatePaymentIntentData {
  clientSecret: string;
}
