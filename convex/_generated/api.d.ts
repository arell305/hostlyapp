/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as backendUtils_clerkWebhooks from "../backendUtils/clerkWebhooks.js";
import type * as backendUtils_helper from "../backendUtils/helper.js";
import type * as backendUtils_pdfMonkeyWebhooks from "../backendUtils/pdfMonkeyWebhooks.js";
import type * as backendUtils_stripe from "../backendUtils/stripe.js";
import type * as backendUtils_stripeConnect from "../backendUtils/stripeConnect.js";
import type * as backendUtils_stripeWebhooks from "../backendUtils/stripeWebhooks.js";
import type * as backendUtils_validation from "../backendUtils/validation.js";
import type * as clerk from "../clerk.js";
import type * as connectedAccounts from "../connectedAccounts.js";
import type * as connectedPayments from "../connectedPayments.js";
import type * as customers from "../customers.js";
import type * as events from "../events.js";
import type * as guestListCredits from "../guestListCredits.js";
import type * as guestListEntries from "../guestListEntries.js";
import type * as guestListInfo from "../guestListInfo.js";
import type * as http from "../http.js";
import type * as organizations from "../organizations.js";
import type * as pdfMonkey from "../pdfMonkey.js";
import type * as photo from "../photo.js";
import type * as promoCode from "../promoCode.js";
import type * as promoterPromoCode from "../promoterPromoCode.js";
import type * as sendgrid from "../sendgrid.js";
import type * as stripe from "../stripe.js";
import type * as stripeConnectedCustomers from "../stripeConnectedCustomers.js";
import type * as subscription from "../subscription.js";
import type * as ticketInfo from "../ticketInfo.js";
import type * as tickets from "../tickets.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "backendUtils/clerkWebhooks": typeof backendUtils_clerkWebhooks;
  "backendUtils/helper": typeof backendUtils_helper;
  "backendUtils/pdfMonkeyWebhooks": typeof backendUtils_pdfMonkeyWebhooks;
  "backendUtils/stripe": typeof backendUtils_stripe;
  "backendUtils/stripeConnect": typeof backendUtils_stripeConnect;
  "backendUtils/stripeWebhooks": typeof backendUtils_stripeWebhooks;
  "backendUtils/validation": typeof backendUtils_validation;
  clerk: typeof clerk;
  connectedAccounts: typeof connectedAccounts;
  connectedPayments: typeof connectedPayments;
  customers: typeof customers;
  events: typeof events;
  guestListCredits: typeof guestListCredits;
  guestListEntries: typeof guestListEntries;
  guestListInfo: typeof guestListInfo;
  http: typeof http;
  organizations: typeof organizations;
  pdfMonkey: typeof pdfMonkey;
  photo: typeof photo;
  promoCode: typeof promoCode;
  promoterPromoCode: typeof promoterPromoCode;
  sendgrid: typeof sendgrid;
  stripe: typeof stripe;
  stripeConnectedCustomers: typeof stripeConnectedCustomers;
  subscription: typeof subscription;
  ticketInfo: typeof ticketInfo;
  tickets: typeof tickets;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
