import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { query } from "./_generated/server";
import {
  OrganizationDetails,
  Promoter,
  UserSchema,
  OrganizationSchema,
} from "@/types/types";
import {
  ErrorMessages,
  StripeAccountStatus,
  ResponseStatus,
  UserRole,
} from "@/types/enums";
import {
  GetAllOrganizationsResponse,
  GetOrganizationContextResponse,
  GetOrganizationImagePublicResponse,
  GetOrganizationPublicContextResponse,
  GetPromotersByOrgResponse,
  GetUsersByOrganizationSlugResponse,
} from "@/types/convex-types";
import { Id } from "./_generated/dataModel";
import { requireAuthenticatedUser } from "../utils/auth";
import { handleError, isUserInOrganization } from "./backendUtils/helper";
import {
  validateOrganization,
  validateSubscription,
} from "./backendUtils/validation";
import { ConnectedAccountsSchema } from "@/types/schemas-types";

export const createConvexOrganization = internalMutation({
  args: {
    clerkOrganizationId: v.string(),
    name: v.string(),
    slug: v.string(),
    promoDiscount: v.number(),
    customerId: v.id("customers"),
    photo: v.union(v.id("_storage"), v.null()),
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<Id<"organizations">> => {
    const {
      clerkOrganizationId,
      name,
      slug,
      promoDiscount,
      customerId,
      photo,
      userId,
    } = args;

    try {
      const organizationId = await ctx.db.insert("organizations", {
        clerkOrganizationId,
        name,
        customerId,
        promoDiscount,
        isActive: true,
        slug,
        photo,
      });

      await ctx.db.patch(userId, {
        organizationId: organizationId,
      });

      return organizationId;
    } catch (error) {
      console.error(ErrorMessages.ORGANIZATION_DB_CREATE_ERROR, error);
      throw new Error(ErrorMessages.ORGANIZATION_DB_CREATE_ERROR);
    }
  },
});

export const updateOrganization = internalMutation({
  args: {
    clerkOrganizationId: v.string(),
    name: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    photo: v.optional(v.union(v.id("_storage"), v.null())),
    promoDiscount: v.optional(v.number()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"organizations">> => {
    try {
      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_clerkOrganizationId", (q) =>
          q.eq("clerkOrganizationId", args.clerkOrganizationId)
        )
        .first();

      if (!organization) {
        throw new Error(ErrorMessages.COMPANY_NOT_FOUND);
      }

      const updates: Partial<typeof organization> = {};

      if (args.name !== undefined) {
        updates.name = args.name;
      }

      if (args.isActive !== undefined) {
        updates.isActive = args.isActive;
      }

      if (args.photo !== undefined) {
        updates.photo = args.photo;
      }

      if (args.promoDiscount !== undefined) {
        updates.promoDiscount = args.promoDiscount;
      }

      if (args.slug !== undefined) {
        updates.slug = args.slug;
      }

      // If there are updates, apply the patch
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(organization._id, updates);
      }

      return organization._id;
    } catch (error) {
      console.error(ErrorMessages.COMPANY_DB_UPDATE_ERROR, error);
      throw new Error(ErrorMessages.COMPANY_DB_UPDATE_ERROR);
    }
  },
});

export const getAllOrganizations = query({
  handler: async (ctx): Promise<GetAllOrganizationsResponse> => {
    try {
      await requireAuthenticatedUser(ctx, [
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const organizations: OrganizationSchema[] = await ctx.db
        .query("organizations")
        .withIndex("by_slug")
        .order("asc")
        .collect();

      const customerIds = organizations.map((org) => org.customerId);

      const subscriptions = await ctx.db
        .query("subscriptions")
        .filter((q) =>
          q.or(...customerIds.map((id) => q.eq(q.field("customerId"), id)))
        )
        .collect();

      const subscriptionMap = new Map(
        subscriptions.map((s) => [s.customerId, s])
      );

      const organizationDetails: OrganizationDetails[] = organizations.map(
        (org) => ({
          name: org.name,
          slug: org.slug,
          organizationId: org._id,
          photoStorageId: org.photo,
          subscriptionStatus:
            subscriptionMap.get(org.customerId)?.subscriptionStatus || null,
          subscriptionTier:
            subscriptionMap.get(org.customerId)?.subscriptionTier || null,
        })
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          organizationDetails,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getOrganizationByClerkId = query({
  args: {
    clerkOrganizationId: v.string(),
  },
  handler: async (ctx, args): Promise<OrganizationSchema | null> => {
    try {
      return await ctx.db
        .query("organizations")
        .filter((q) =>
          q.eq(q.field("clerkOrganizationId"), args.clerkOrganizationId)
        )
        .first();
    } catch (error) {
      console.error("Error finding organization by Clerk ID:", error);
      return null;
    }
  },
});

export const internalGetOrganizationByClerkId = internalQuery({
  args: {
    clerkOrganizationId: v.string(),
  },
  handler: async (ctx, args): Promise<OrganizationSchema> => {
    try {
      const organization: OrganizationSchema | null = validateOrganization(
        await ctx.db
          .query("organizations")
          .filter((q) =>
            q.eq(q.field("clerkOrganizationId"), args.clerkOrganizationId)
          )
          .first()
      );

      return organization;
    } catch (error) {
      console.error(ErrorMessages.COMPANY_DB_QUERY_ERROR, error);
      throw new Error(ErrorMessages.COMPANY_DB_QUERY_ERROR);
    }
  },
});

export const getPromotersByOrg = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args): Promise<GetPromotersByOrgResponse> => {
    const { organizationId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Moderator,
      ]);

      const organization = validateOrganization(
        await ctx.db.get(organizationId)
      );

      isUserInOrganization(identity, organization.clerkOrganizationId);

      const promoters: UserSchema[] = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("organizationId"), organization._id))
        .filter((q) => q.eq(q.field("role"), UserRole.Promoter))
        .collect();

      const formattedPromoters: Promoter[] = promoters.map((promoter) => ({
        promoterUserId: promoter._id,
        name: promoter.name ?? "Unkown",
      }));

      return {
        status: ResponseStatus.SUCCESS,
        data: { promoters: formattedPromoters },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getOrganizationImagePublic = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args): Promise<GetOrganizationImagePublicResponse> => {
    const { slug } = args;
    try {
      const organization = validateOrganization(
        await ctx.db
          .query("organizations")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first()
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          photo: organization.photo,
          name: organization.name,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getOrganizationByName = internalQuery({
  args: { name: v.string() },
  handler: async (ctx, args): Promise<OrganizationSchema | null> => {
    try {
      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_name", (q) => q.eq("name", args.name))
        .first();
      return organization;
    } catch (error) {
      console.error(ErrorMessages.ORGANIZATION_DB_QUERY_NAME_ERROR, error);
      throw new Error(ErrorMessages.ORGANIZATION_DB_QUERY_NAME_ERROR);
    }
  },
});

export const getUsersByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args): Promise<GetUsersByOrganizationSlugResponse> => {
    const { organizationId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx);

      const organization = validateOrganization(
        await ctx.db.get(organizationId)
      );

      isUserInOrganization(identity, organization.clerkOrganizationId);

      const users: UserSchema[] = await ctx.db
        .query("users")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", organization._id)
        )
        .collect();

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkOrganizationId: organization.clerkOrganizationId,
          users,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getOrganizationById = internalQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args): Promise<OrganizationSchema | null> => {
    try {
      const organization = validateOrganization(
        await ctx.db.get(args.organizationId)
      );

      return organization;
    } catch (error) {
      console.error(ErrorMessages.COMPANY_DB_QUERY_ID_ERROR, error);
      throw new Error(ErrorMessages.COMPANY_DB_QUERY_ID_ERROR);
    }
  },
});

export const getOrganizationContext = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args): Promise<GetOrganizationContextResponse> => {
    const { slug } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx);

      const organization = validateOrganization(
        await ctx.db
          .query("organizations")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first()
      );

      isUserInOrganization(identity, organization.clerkOrganizationId);

      const customerId = organization.customerId;

      const subscription = validateSubscription(
        await ctx.db
          .query("subscriptions")
          .withIndex("by_customerId", (q) => q.eq("customerId", customerId))
          .first()
      );

      const connectedAccount: ConnectedAccountsSchema | null = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) => q.eq("customerId", customerId))
        .first();

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          organization,
          connectedAccountId: connectedAccount
            ? connectedAccount.stripeAccountId
            : null,
          connectedAccountStatus: connectedAccount
            ? connectedAccount.status
            : null,
          subscription: subscription,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getPublicOrganizationContext = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args): Promise<GetOrganizationPublicContextResponse> => {
    const { slug } = args;
    try {
      const organization = validateOrganization(
        await ctx.db
          .query("organizations")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first()
      );

      const connectedAccount: ConnectedAccountsSchema | null = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) =>
          q.eq("customerId", organization.customerId)
        )
        .first();

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          organizationPublic: {
            id: organization._id,
            name: organization.name,
            photo: organization.photo,
            connectedAccountStripeId: connectedAccount?.stripeAccountId,
            isStripeEnabled:
              connectedAccount?.status === StripeAccountStatus.VERIFIED,
          },
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
