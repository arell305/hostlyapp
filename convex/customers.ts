import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { ResponseStatus, SubscriptionStatus, UserRole } from "../utils/enum";
import { OrganizationsSchema } from "../app/types/types";
import { internal } from "./_generated/api";
import { ErrorMessages } from "@/types/enums";
import {
  GetCustomerTierByOrganizationNameResponse,
  CancelSubscriptionResponse,
  ResumeSubscriptionResponse,
  GetCustomerDetailsResponse,
} from "@/types/convex-types";
import {
  CustomerSchema,
  CustomerWithCompanyName,
  UserSchema,
} from "@/types/schemas-types";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateCustomer,
  validateOrganization,
  validateSubscription,
  validateUser,
} from "./backendUtils/validation";
import {
  cancelStripeSubscriptionAtPeriodEnd,
  resumeStripeSubscription,
} from "./backendUtils/stripe";
import { isUserInOrganization, shouldExposeError } from "./backendUtils/helper";
import { Id } from "./_generated/dataModel";

export const findCustomerByEmail = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<CustomerSchema | null> => {
    try {
      return await ctx.db
        .query("customers")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
    } catch (error) {
      console.error("Error finding customer by email:", error);
      throw new Error(ErrorMessages.CUSTOMER_DB_QUERY_BY_EMAIL);
    }
  },
});

export const findCustomerById = internalQuery({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args): Promise<CustomerSchema | null> => {
    try {
      return await ctx.db
        .query("customers")
        .filter((q) => q.eq(q.field("_id"), args.customerId))
        .first();
    } catch (error) {
      console.error(ErrorMessages.CUSTOMER_DB_QUERY_ID_ERROR, error);
      throw new Error(ErrorMessages.CUSTOMER_DB_QUERY_ID_ERROR);
    }
  },
});

export const findCustomerByClerkId = internalQuery({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user: UserSchema | null = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user?.customerId) {
      throw Error(ErrorMessages.USER_NOT_FOUND);
    }

    const customer: CustomerSchema | null = await ctx.db.get(user.customerId);

    if (!customer) {
      throw Error(ErrorMessages.CUSTOMER_NOT_FOUND);
    }

    if (!user.organizationId) {
      throw new Error(ErrorMessages.COMPANY_NOT_FOUND);
    }

    const organization: OrganizationsSchema | null = await ctx.db.get(
      user.organizationId
    );

    if (!organization) {
      throw new Error(ErrorMessages.COMPANY_NOT_FOUND);
    }

    return {
      ...customer,
      companyName: organization.name,
    };
  },
});

//used in stripe
export const findCustomerWithCompanyNameByClerkId = internalQuery({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args): Promise<CustomerWithCompanyName> => {
    try {
      const user: UserSchema | null = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId)
        )
        .first();

      const validatedUser = validateUser(user, true, true);

      const customer: CustomerSchema | null = await ctx.db.get(
        validatedUser.customerId as Id<"customers">
      );

      const validatedCustomer = validateCustomer(customer);

      const organization: OrganizationsSchema | null = await ctx.db.get(
        validatedUser.organizationId as Id<"organizations">
      );

      const validatedOrganization = validateOrganization(organization);

      const customerWithCompanyName: CustomerWithCompanyName = {
        ...validatedCustomer,
        companyName: validatedOrganization.name,
      };

      return customerWithCompanyName;
    } catch (error) {
      console.error(error);
      throw new Error(ErrorMessages.CUSTOMER_DB_QUERY_CLERK_ERROR);
    }
  },
});

const allowedFields = {
  stripeCustomerId: v.optional(v.string()),
  email: v.optional(v.string()),
  paymentMethodId: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
  cardBrand: v.optional(v.string()),
  last4: v.optional(v.string()),
};

export const updateCustomer = internalMutation({
  args: {
    id: v.id("customers"),
    updates: v.object(allowedFields),
  },
  handler: async (ctx, args): Promise<Id<"customers">> => {
    const { id, updates } = args;

    try {
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(id, updates);
      }
      return id;
    } catch (error) {
      console.error(`Failed to update customer ${id}:`, error);
      throw new Error(ErrorMessages.CUSTOMER_DB_UPDATE_ERROR);
    }
  },
});

export const getCustomerDetails = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args): Promise<GetCustomerDetailsResponse> => {
    const { organizationId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const organization = validateOrganization(
        await ctx.db.get(organizationId)
      );

      isUserInOrganization(identity, organization.clerkOrganizationId);

      const customer = validateCustomer(
        await ctx.db.get(organization.customerId)
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          customer,
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
  args: {},
  handler: async (ctx): Promise<CancelSubscriptionResponse> => {
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);

      const customer = validateCustomer(
        await ctx.runQuery(internal.customers.findCustomerByEmail, {
          email: idenitity.email as string,
        })
      );

      const subscription = validateSubscription(
        await ctx.runQuery(
          internal.subscription.getUsableSubscriptionByCustomerId,
          {
            customerId: customer._id,
          }
        )
      );

      await cancelStripeSubscriptionAtPeriodEnd(
        subscription.stripeSubscriptionId
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
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

export const resumeSubscription = action({
  args: {},
  handler: async (ctx): Promise<ResumeSubscriptionResponse> => {
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);

      const customer = validateCustomer(
        await ctx.runQuery(internal.customers.findCustomerByEmail, {
          email: idenitity.email as string,
        })
      );

      const subscription = validateSubscription(
        await ctx.runQuery(
          internal.subscription.getSubscriptionByCustomerAndStatus,
          {
            customerId: customer._id,
            subscriptionStatus: SubscriptionStatus.PENDING_CANCELLATION,
          }
        )
      );
      await resumeStripeSubscription(subscription.stripeSubscriptionId);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
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

export const GetCustomerTierBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<GetCustomerTierByOrganizationNameResponse> => {
    const { slug } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx);
      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      const validatedOrganization = validateOrganization(organization);

      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

      const customer: CustomerSchema | null = await ctx.db.get(
        validatedOrganization.customerId
      );

      const validatedCustomer = validateCustomer(customer);
      const subscription = validateSubscription(
        await ctx.db
          .query("subscriptions")
          .withIndex("by_customerId", (q) =>
            q.eq("customerId", validatedCustomer._id)
          )
          .filter((q) =>
            q.or(
              q.eq("subscriptionStatus", SubscriptionStatus.ACTIVE as string),
              q.eq("subscriptionStatus", SubscriptionStatus.TRIALING as string),
              q.eq("subscriptionStatus", SubscriptionStatus.PAST_DUE as string),
              q.eq(
                "subscriptionStatus",
                SubscriptionStatus.PENDING_CANCELLATION as string
              )
            )
          )
          .first()
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          customerTier: subscription.subscriptionTier,
          customerId: validatedCustomer._id,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(ErrorMessages.INTERNAL_ERROR, errorMessage, error);

      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: shouldExposeError(errorMessage)
          ? errorMessage
          : ErrorMessages.GENERIC_ERROR,
      };
    }
  },
});

export const createCustomer = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    email: v.string(),
    paymentMethodId: v.string(),
    cardBrand: v.optional(v.string()),
    last4: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"customers">> => {
    try {
      const { stripeCustomerId, email, paymentMethodId, cardBrand, last4 } =
        args;

      const customerId = await ctx.db.insert("customers", {
        stripeCustomerId,
        email,
        paymentMethodId,
        isActive: true,
        cardBrand,
        last4,
      });

      return customerId;
    } catch (error) {
      console.error("Error inserting customer into the database:", error);
      throw new Error(ErrorMessages.CUSTOMER_DB_CREATE);
    }
  },
});

export const updateCustomerByStripeCustomerId = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    paymentDetails: v.optional(
      v.object({
        paymentMethodId: v.optional(v.string()),
        last4: v.optional(v.string()),
        cardBrand: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args): Promise<Id<"customers">> => {
    try {
      const customer = validateCustomer(
        await ctx.db
          .query("customers")
          .withIndex("by_stripeCustomerId", (q) =>
            q.eq("stripeCustomerId", args.stripeCustomerId)
          )
          .first()
      );

      const updateFields: Record<string, string | undefined> = {};

      if (args.paymentDetails) {
        if (args.paymentDetails.paymentMethodId !== undefined) {
          updateFields.paymentMethodId = args.paymentDetails.paymentMethodId;
        }
        if (args.paymentDetails.last4 !== undefined) {
          updateFields.last4 = args.paymentDetails.last4;
        }
        if (args.paymentDetails.cardBrand !== undefined) {
          updateFields.cardBrand = args.paymentDetails.cardBrand;
        }
      }

      if (Object.keys(updateFields).length > 0) {
        await ctx.db.patch(customer._id, updateFields);
      }

      return customer._id;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw new Error(ErrorMessages.CUSTOMER_DB_UPDATE_ERROR);
    }
  },
});
