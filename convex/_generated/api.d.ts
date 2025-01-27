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
import type * as clerk from "../clerk.js";
import type * as customers from "../customers.js";
import type * as events from "../events.js";
import type * as guestListInfo from "../guestListInfo.js";
import type * as guestLists from "../guestLists.js";
import type * as http from "../http.js";
import type * as organizations from "../organizations.js";
import type * as photo from "../photo.js";
import type * as promoCode from "../promoCode.js";
import type * as promoCodeUsage from "../promoCodeUsage.js";
import type * as promoterPromoCode from "../promoterPromoCode.js";
import type * as stripe from "../stripe.js";
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
  clerk: typeof clerk;
  customers: typeof customers;
  events: typeof events;
  guestListInfo: typeof guestListInfo;
  guestLists: typeof guestLists;
  http: typeof http;
  organizations: typeof organizations;
  photo: typeof photo;
  promoCode: typeof promoCode;
  promoCodeUsage: typeof promoCodeUsage;
  promoterPromoCode: typeof promoterPromoCode;
  stripe: typeof stripe;
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
