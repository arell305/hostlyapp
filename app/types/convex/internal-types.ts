import { Id } from "../../../convex/_generated/dataModel";
import { ResponseStatus } from "../../../utils/enum";
import {
  CustomerSchema,
  CustomerWithCompanyName,
  EventSchema,
  TicketInfoSchema,
} from "../schemas-types";
import { ErrorResponse } from "../types";

export type DeleteConnectedAccountResponse =
  | DeleteConnectedAccountSuccess
  | ErrorResponse;

export interface DeleteConnectedAccountSuccess {
  status: ResponseStatus.SUCCESS;
  data: DeleteConnectedAccountData;
}

export interface DeleteConnectedAccountData {
  connectedAccountId: Id<"connectedAccounts">;
}

export type FindCustomerWithCompanyNameByClerkIdResponse =
  | findCustomerWithCompanyNameByClerkIdSuccess
  | ErrorResponse;

export interface findCustomerWithCompanyNameByClerkIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: findCustomerWithCompanyNameByClerkIdData;
}

export interface findCustomerWithCompanyNameByClerkIdData {
  customer: CustomerWithCompanyName;
}

export type SaveConnectedAccountResponse =
  | SaveConnectedAccountSuccess
  | ErrorResponse;

export interface SaveConnectedAccountSuccess {
  status: ResponseStatus.SUCCESS;
  data: SaveConnectedAccountData;
}

export interface SaveConnectedAccountData {
  connectedAccountId: Id<"connectedAccounts">;
}

export interface GetEventWithTicketsData {
  event: EventSchema;
  promoterUserId: Id<"users"> | null;
}
