import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import {
  ResponseStatus,
  SubscriptionStatus,
  SubscriptionTier,
} from "../utils/enum";
import {
  CancelSubscriptionResponse,
  Customer,
  CustomerSchema,
  CustomerWithPayment,
  GetCustomerDetailsResponse,
  OrganizationsSchema,
  ResumeSubscriptionResponse,
  UpdateListEventCountResponse,
} from "../app/types/types";
import { checkIsHostlyAdmin, getFutureISOString } from "../utils/helpers";
import { SubscriptionStatusConvex, SubscriptionTierConvex } from "./schema";
import { DateTime } from "luxon";
import { internal } from "./_generated/api";
import Stripe from "stripe";
import { ErrorMessages } from "@/types/enums";
import {
  GetCustomerTierByOrganizationNameResponse,
  GetOrganizationByNameQueryResponse,
  UpdatePromoterPromoCodeResponse,
} from "@/types/convex-types";

export const insertCustomerAndSubscription = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    email: v.string(),
    paymentMethodId: v.string(),
    subscriptionTier: SubscriptionTierConvex,
    trialEndDate: v.union(v.string(), v.null()),
    subscriptionStatus: SubscriptionStatusConvex,
  },
  handler: async (ctx, args) => {
    try {
      const nextPayment = args.trialEndDate || getFutureISOString(30);
      const customerId = await ctx.db.insert("customers", {
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        email: args.email,
        paymentMethodId: args.paymentMethodId,
        subscriptionStatus: args.subscriptionStatus,
        subscriptionTier: args.subscriptionTier,
        trialEndDate: args.trialEndDate,
        cancelAt: null,
        nextPayment,
        subscriptionStartDate: Date.now().toString(),
      });
      // await ctx.scheduler.runAt(
      //   DateTime.fromISO(nextPayment).toMillis(),
      //   internal.customers.resetGuestListEventAndPayment,
      //   { customerId }
      // );
      console.log(
        `Scheduled resetGuestListEvent for customer ${customerId} at ${nextPayment}`
      );
      return customerId;
    } catch (error) {
      console.error("Error inserting customer into the database:", error);
      throw new Error("Failed to insert customer");
    }
  },
});

export const findCustomerByEmail = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<CustomerSchema | null> => {
    try {
      const customer: CustomerSchema | null = await ctx.db
        .query("customers")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();

      // If a customer is found, map the `subscriptionStatus` string to the `SubscriptionStatus` enum
      if (customer) {
        return {
          ...customer,
          subscriptionStatus: customer.subscriptionStatus as SubscriptionStatus, // Cast or map the status
        }; // Ensure the returned type is the `Customer` interface
      }

      return null;
    } catch (error) {
      console.error("Error finding customer by email:", error);
      return null;
    }
  },
});

export const findCustomerById = internalQuery({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args): Promise<CustomerSchema | null> => {
    try {
      const customer: CustomerSchema | null = await ctx.db
        .query("customers")
        .filter((q) => q.eq(q.field("_id"), args.customerId))
        .first();

      // If a customer is found, map the `subscriptionStatus` string to the `SubscriptionStatus` enum
      if (customer) {
        return {
          ...customer,
          subscriptionStatus: customer.subscriptionStatus as SubscriptionStatus, // Cast or map the status
        }; // Ensure the returned type is the `Customer` interface
      }

      return null;
    } catch (error) {
      console.error("Error finding customer by email:", error);
      return null;
    }
  },
});

const allowedFields = {
  stripeCustomerId: v.optional(v.string()),
  subscriptionStatus: v.optional(SubscriptionStatusConvex), // Adjust if SubscriptionStatus has specific values
  trialEndDate: v.optional(v.union(v.string(), v.null())),
  stripeSubscriptionId: v.optional(v.string()),
  email: v.optional(v.string()),
  paymentMethodId: v.optional(v.string()),
  subscriptionTier: v.optional(SubscriptionTierConvex), // Adjust if SubscriptionTier has specific values
  nextPayment: v.optional(v.union(v.string(), v.null())),
};

export const updateCustomer = internalMutation({
  args: {
    id: v.id("customers"),
    updates: v.object(allowedFields), // Expect an object for updates
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;

    // Check if there are any valid fields to update
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(id, updates);
    }
    return id;
  },
});

export const getCustomerSubscriptionTier = query({
  args: { clerkOrganizationId: v.string() },
  handler: async (ctx, args) => {
    // First, find the organization by its clerkOrganizationId
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_clerkOrganizationId", (q) =>
        q.eq("clerkOrganizationId", args.clerkOrganizationId)
      )
      .first();
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Then, get the customer associated with this organization
    const customer = await ctx.db.get(organization.customerId);

    if (!customer) {
      throw new Error("Customer not found for this organization");
    }

    // Return the subscription tier
    return {
      subscriptionTier: customer.subscriptionTier,
      customerId: customer._id,
      nextCycle: customer.nextPayment,
      status: customer.subscriptionStatus,
    };
  },
});

// export const updateGuestListEventCount = mutation({
//   args: { customerId: v.id("customers") },
//   handler: async (ctx, args): Promise<UpdateListEventCountResponse> => {
//     try {
//       const identity = await ctx.auth.getUserIdentity();
//       if (!identity) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.UNAUTHENTICATED,
//         };
//       }

//       const customer: CustomerSchema | null = await ctx.db.get(args.customerId);

//       if (!customer) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }
//       if (customer.subscriptionTier !== SubscriptionTier.PLUS) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: "Not on Plus tier",
//         };
//       }
//       const updatedCount: number = (customer.guestListEventCount || 0) + 1;
//       await ctx.db.patch(args.customerId, {
//         guestListEventCount: updatedCount,
//       });
//       return {
//         status: ResponseStatus.SUCCESS,
//         data: {
//           remaingEvents: updatedCount,
//         },
//       };
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
//       console.error(errorMessage, error);
//       return {
//         status: ResponseStatus.ERROR,
//         data: null,
//         error: errorMessage,
//       };
//     }
//   },
// });

// export const resetGuestListEventAndPayment = internalMutation({
//   args: { customerId: v.id("customers") },
//   handler: async (ctx, { customerId }) => {
//     // Fetch the customer's data
//     const customer = await ctx.db.get(customerId);

//     if (!customer) {
//       console.log(`Customer with ID ${customerId} does not exist.`);
//       return;
//     }

//     // Check if `nextPayment` is null and stop scheduling if it is
//     if (
//       customer.subscriptionStatus === SubscriptionStatus.CANCELED ||
//       !customer.nextPayment
//     ) {
//       console.log(
//         `Stopping scheduler for customer ${customerId} as subscription status is canceled.`
//       );
//       return;
//     }
//     // Reset the guestListEventCount
//     await ctx.db.patch(customerId, {
//       guestListEventCount: 0,
//     });

//     // Calculate the new `nextPayment` date (e.g., 1 month from now)
//     const nextPaymentDate = new Date(customer.nextPayment);
//     nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

//     // Update the customer’s `nextPayment` field in the database
//     await ctx.db.patch(customerId, {
//       nextPayment: nextPaymentDate.toISOString(),
//     });

//     // Schedule this function to run again at the new `nextPayment` date
//     await ctx.scheduler.runAt(
//       nextPaymentDate.getTime(),
//       internal.customers.resetGuestListEventAndPayment,
//       { customerId }
//     );
//   },
// });

export const getCustomerDetails = action({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args): Promise<GetCustomerDetailsResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const existingCustomer: CustomerSchema | null = await ctx.runQuery(
        internal.customers.findCustomerById,
        { customerId: args.customerId }
      );
      if (!existingCustomer) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }
      const createCustomerWithPayment = (
        brand?: string,
        last4?: string,
        currentSubscriptionAmount?: number,
        discountPercentage?: number
      ): CustomerWithPayment => ({
        ...existingCustomer!,
        brand,
        last4,
        currentSubscriptionAmount,
        discountPercentage,
      });
      const stripe = new Stripe(process.env.STRIPE_KEY!, {
        apiVersion: "2024-06-20",
      });

      const paymentMethods: Stripe.Response<
        Stripe.ApiList<Stripe.PaymentMethod>
      > = await stripe.paymentMethods.list({
        customer: existingCustomer.stripeCustomerId,
        type: "card",
      });
      const defaultPaymentMethod: Stripe.PaymentMethod = paymentMethods.data[0];

      const subscription: Stripe.Response<Stripe.Subscription> =
        await stripe.subscriptions.retrieve(
          existingCustomer.stripeSubscriptionId
        );
      const currentPrice = subscription.items.data[0].price;
      const amount = currentPrice.unit_amount; // Amount in cents

      // Extract discount information if available
      let discountPercentage = 0;

      if (subscription.discount) {
        discountPercentage = subscription.discount.coupon.percent_off || 0; // Get the discount percentage directly
      }

      const customerWithPayment: CustomerWithPayment =
        createCustomerWithPayment(
          defaultPaymentMethod?.card?.brand, // Use optional chaining to avoid undefined error
          defaultPaymentMethod?.card?.last4,
          amount ? amount / 100 : 0,
          discountPercentage
        );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          customerData: customerWithPayment,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});
export const cancelSubscription = action({
  args: { customerEmail: v.string() },
  handler: async (ctx, args): Promise<CancelSubscriptionResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const existingCustomer: CustomerSchema | null = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        { email: args.customerEmail }
      );

      if (!existingCustomer) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const stripe = new Stripe(process.env.STRIPE_KEY!, {
        apiVersion: "2024-06-20",
      });

      await Promise.all([
        stripe.subscriptions.update(existingCustomer.stripeSubscriptionId, {
          cancel_at_period_end: true,
        }),
        ctx.runMutation(internal.customers.updateCustomer, {
          id: existingCustomer._id,
          updates: {
            subscriptionStatus: SubscriptionStatus.CANCELED,
          },
        }),
      ]);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          id: existingCustomer._id,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const resumeSubscription = action({
  args: { customerEmail: v.string() },
  handler: async (ctx, args): Promise<ResumeSubscriptionResponse> => {
    try {
      // Fetch existing customer by email
      const existingCustomer: CustomerSchema | null = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        { email: args.customerEmail }
      );
      if (!existingCustomer) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }
      const stripe = new Stripe(process.env.STRIPE_KEY!, {
        apiVersion: "2024-06-20",
      });

      const subscription: Stripe.Response<Stripe.Subscription> =
        await stripe.subscriptions.retrieve(
          existingCustomer.stripeSubscriptionId
        );

      if (subscription.cancel_at_period_end) {
        // Resume the subscription by setting cancel_at_period_end to false
        await stripe.subscriptions.update(
          existingCustomer.stripeSubscriptionId,
          {
            cancel_at_period_end: false, // Resuming the subscription
          }
        );

        // Optionally, update the subscription status in your database to "active"
        if (existingCustomer && existingCustomer._id) {
          // Update customer subscription to ACTIVE if they had a previous account (no trial period)
          await ctx.runMutation(internal.customers.updateCustomer, {
            id: existingCustomer._id, // Update using the customer's ID
            updates: {
              subscriptionStatus: SubscriptionStatus.ACTIVE,
            },
          });
        }
        return {
          status: ResponseStatus.SUCCESS,
          data: {
            id: existingCustomer._id,
          },
        };
      } else {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: "Subscription is already active.",
        };
        // If the subscription is not canceled or it was already resumed
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const GetCustomerTierByOrganizationName = query({
  args: {
    name: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<GetCustomerTierByOrganizationNameResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .filter((q) => q.eq(q.field("name"), args.name))
        .first();
      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.COMPANY_NOT_FOUND,
        };
      }
      const isHostlyAdmin = checkIsHostlyAdmin(identity.role as string);

      if (
        organization.clerkOrganizationId !==
          (identity.clerk_org_id as string) &&
        !isHostlyAdmin
      ) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const customer: CustomerSchema | null = await ctx.db.get(
        organization.customerId
      );

      if (!customer) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.CUSTOMER_NOT_FOUND,
        };
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          customerTier: customer.subscriptionTier,
          customerId: customer._id,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});
