import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { ErrorMessages, UserRole } from "@/types/enums";
import { CustomerWithCompanyName } from "@/types/schemas-types";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateCustomer,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import { isUserInOrganization } from "./backendUtils/helper";
import { Doc, Id } from "./_generated/dataModel";

export const findCustomerByEmail = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"customers"> | null> => {
    return await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

export const findCustomerById = internalQuery({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args): Promise<Doc<"customers"> | null> => {
    return await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("_id"), args.customerId))
      .first();
  },
});

export const findCustomerByClerkId = internalQuery({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user: Doc<"users"> | null = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user?.customerId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.USER_NOT_FOUND,
      });
    }

    const customer = await ctx.db.get(user.customerId);

    if (!customer) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.CUSTOMER_NOT_FOUND,
      });
    }

    if (!user.organizationId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.COMPANY_NOT_FOUND,
      });
    }

    const organization = await ctx.db.get(user.organizationId);

    if (!organization) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.COMPANY_NOT_FOUND,
      });
    }

    return {
      ...customer,
      companyName: organization.name,
    };
  },
});

export const findCustomerWithCompanyNameByClerkId = internalQuery({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args): Promise<CustomerWithCompanyName> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    const validatedUser = validateUser(user, true, true);

    const customer = await ctx.db.get(
      validatedUser.customerId as Id<"customers">
    );

    const validatedCustomer = validateCustomer(customer);

    const organization = await ctx.db.get(
      validatedUser.organizationId as Id<"organizations">
    );

    const validatedOrganization = validateOrganization(organization);

    const customerWithCompanyName: CustomerWithCompanyName = {
      ...validatedCustomer,
      companyName: validatedOrganization.name,
    };

    return customerWithCompanyName;
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

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(id, updates);
    }
    return id;
  },
});

export const getCustomerDetails = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args): Promise<Doc<"customers">> => {
    const { organizationId } = args;
    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
    ]);

    const organization = validateOrganization(await ctx.db.get(organizationId));

    isUserInOrganization(identity, organization.clerkOrganizationId);

    const customer = validateCustomer(
      await ctx.db.get(organization.customerId)
    );

    return customer;
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
    const { stripeCustomerId, email, paymentMethodId, cardBrand, last4 } = args;

    const customerId = await ctx.db.insert("customers", {
      stripeCustomerId,
      email,
      paymentMethodId,
      isActive: true,
      cardBrand,
      last4,
    });

    return customerId;
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
  },
});

export const findUserAndCustomerByClerkId = internalQuery({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ user: Doc<"users">; customer: Doc<"customers"> }> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user?.customerId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.USER_NOT_FOUND,
      });
    }

    const customer = await ctx.db.get(user.customerId);

    if (!customer) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.CUSTOMER_NOT_FOUND,
      });
    }

    if (!user.organizationId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.COMPANY_NOT_FOUND,
      });
    }

    validateOrganization(await ctx.db.get(user.organizationId));

    return {
      user,
      customer,
    };
  },
});
