import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { ResponseStatus, SubscriptionStatus, UserRole } from "../utils/enum";
import {
  CustomerSubscriptionInfo,
  CustomerWithPayment,
  OrganizationsSchema,
} from "../app/types/types";
import { checkIsHostlyAdmin, getFutureISOString } from "../utils/helpers";
import { SubscriptionStatusConvex, SubscriptionTierConvex } from "./schema";
import { internal } from "./_generated/api";
import Stripe from "stripe";
import { ErrorMessages } from "@/types/enums";
import {
  GetCustomerDetailsBySlugResponse,
  GetCustomerTierByOrganizationNameResponse,
  CancelSubscriptionResponse,
  ResumeSubscriptionResponse,
  GetCustomerSubscriptionTierBySlugResponse,
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
  validateUser,
} from "./backendUtils/validation";
import {
  cancelStripeSubscriptionAtPeriodEnd,
  fetchCustomerPaymentDetails,
  resumeStripeSubscription,
} from "./backendUtils/stripe";
import { isUserInOrganization } from "./backendUtils/helper";
import { Id } from "./_generated/dataModel";

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
        isActive: true,
      });
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

      if (customer) {
        return {
          ...customer,
          subscriptionStatus: customer.subscriptionStatus as SubscriptionStatus, // Cast or map the status
        };
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

      if (!customer) {
        return null;
      }

      return {
        ...customer,
        subscriptionStatus: customer.subscriptionStatus as SubscriptionStatus, // Cast or map the status
      }; // Ensure the returned type is the `Customer` interface
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

    if (!user.clerkOrganizationId) {
      throw new Error(ErrorMessages.COMPANY_NOT_FOUND);
    }

    const organization: OrganizationsSchema | null = await ctx.db
      .query("organizations")
      .withIndex("by_clerkOrganizationId", (q) =>
        q.eq("clerkOrganizationId", user.clerkOrganizationId as string)
      )
      .first();

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
  subscriptionStatus: v.optional(SubscriptionStatusConvex), // Adjust if SubscriptionStatus has specific values
  trialEndDate: v.optional(v.union(v.string(), v.null())),
  stripeSubscriptionId: v.optional(v.string()),
  email: v.optional(v.string()),
  paymentMethodId: v.optional(v.string()),
  subscriptionTier: v.optional(SubscriptionTierConvex), // Adjust if SubscriptionTier has specific values
  nextPayment: v.optional(v.union(v.string(), v.null())),
  isActive: v.optional(v.boolean()),
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

// To be Deleted
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

export const getCustomerSubscriptionTierBySlug = query({
  args: { slug: v.string() },
  handler: async (
    ctx,
    args
  ): Promise<GetCustomerSubscriptionTierBySlugResponse> => {
    const { slug } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx);

      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      const validatedOrganization = validateOrganization(organization, true);

      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

      const customer = await ctx.db.get(validatedOrganization.customerId);

      const validatedCustomer = validateCustomer(customer, true);

      function getCustomerSubscriptionInfo(
        customer: CustomerSchema
      ): CustomerSubscriptionInfo {
        return {
          subscriptionTier: customer.subscriptionTier,
          customerId: customer._id,
          nextCycle: customer.nextPayment,
          status: customer.subscriptionStatus,
        };
      }

      const customerSubscription =
        getCustomerSubscriptionInfo(validatedCustomer);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          customerSubscription,
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

export const getCustomerDetailsBySlug = action({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args): Promise<GetCustomerDetailsBySlugResponse> => {
    const { slug } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const organization = await ctx.runQuery(
        internal.organizations.getOrganizationBySlug,
        { slug }
      );

      const validatedOrganization: OrganizationsSchema =
        validateOrganization(organization);

      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

      const customer: CustomerSchema | null = await ctx.runQuery(
        internal.customers.findCustomerById,
        { customerId: validatedOrganization.customerId }
      );
      const validatedCustomer = validateCustomer(customer);

      const customerWithPayment: CustomerWithPayment =
        await fetchCustomerPaymentDetails(validatedCustomer);

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
  args: {},
  handler: async (ctx): Promise<CancelSubscriptionResponse> => {
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);

      const customer: CustomerSchema | null = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        { email: idenitity.email as string }
      );

      const validatedCustomer = validateCustomer(customer);

      await Promise.all([
        cancelStripeSubscriptionAtPeriodEnd(
          validatedCustomer.stripeSubscriptionId
        ),
        ctx.runMutation(internal.customers.updateCustomer, {
          id: validatedCustomer._id,
          updates: {
            subscriptionStatus: SubscriptionStatus.PENDING_CANCELLATION,
          },
        }),
      ]);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          customerId: validatedCustomer._id,
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

      const customer: CustomerSchema | null = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        { email: idenitity.email as string }
      );

      const validatedCustomer = validateCustomer(customer);

      await Promise.all([
        resumeStripeSubscription(validatedCustomer.stripeSubscriptionId),
        ctx.runMutation(internal.customers.updateCustomer, {
          id: validatedCustomer._id,
          updates: {
            subscriptionStatus: SubscriptionStatus.ACTIVE,
          },
        }),
      ]);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          customerId: validatedCustomer._id,
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
