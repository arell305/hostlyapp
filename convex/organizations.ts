import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { query } from "./_generated/server";
import { ResponseStatus, UserRole } from "../utils/enum";
import {
  OrganizationDetails,
  OrganizationsSchema,
  Promoter,
  UserSchema,
} from "@/types/types";
import { ErrorMessages } from "@/types/enums";
import {
  GetAllOrganizationsResponse,
  GetOrganizationByNameQueryResponse,
  GetPromotersBySlugResponse,
  GetUsersByOrganizationSlugResponse,
} from "@/types/convex-types";
import { Id } from "./_generated/dataModel";
import { requireAuthenticatedUser } from "../utils/auth";
import { checkIsHostlyAdmin } from "../utils/helpers";
import { isUserInOrganization } from "./backendUtils/helper";
import { validateOrganization } from "./backendUtils/validation";

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

export const getOrganizationByName = internalQuery({
  args: {
    companyName: v.string(),
  },
  handler: async (ctx, args): Promise<OrganizationsSchema> => {
    try {
      const organization = await ctx.db
        .query("organizations")
        .filter((q) => q.eq(q.field("name"), args.companyName))
        .first();

      if (!organization) {
        throw new Error(ErrorMessages.COMPANY_NOT_FOUND);
      }

      if (!organization.isActive) {
        throw new Error(ErrorMessages.COMPANY_INACTIVE);
      }

      return organization;
    } catch (error) {
      console.error("Error in getOrganizationByName:", error);
      throw error;
    }
  },
});

export const getOrganizationByNameQuery = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args): Promise<GetOrganizationByNameQueryResponse> => {
    try {
      const identity = await requireAuthenticatedUser(ctx);

      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .filter((q) => q.eq(q.field("slug"), args.slug))
        .first();
      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.COMPANY_NOT_FOUND,
        };
      }
      if (!organization.isActive) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.COMPANY_INACTIVE,
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
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          organization,
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

export const getAllOrganizations = query({
  handler: async (ctx): Promise<GetAllOrganizationsResponse> => {
    try {
      await requireAuthenticatedUser(ctx, [
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const organizations: OrganizationsSchema[] = await ctx.db
        .query("organizations")
        .withIndex("by_name")
        .order("asc")
        .collect();

      const customerIds = organizations.map((org) => org.customerId);

      const customers = await ctx.db
        .query("customers")
        .filter((q) =>
          q.or(...customerIds.map((id) => q.eq(q.field("_id"), id)))
        )
        .collect();

      // Create a lookup table for customers by ID
      const customerMap = new Map(customers.map((c) => [c._id, c]));

      const organizationDetails: OrganizationDetails[] = organizations.map(
        (org) => ({
          name: org.name,
          slug: org.slug,
          organizationId: org._id,
          photoStorageId: org.photo,
          subscriptionStatus:
            customerMap.get(org.customerId)?.subscriptionStatus || null,
          subscriptionTier:
            customerMap.get(org.customerId)?.subscriptionTier || null,
        })
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          organizationDetails,
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

export const getOrganizationByClerkId = query({
  args: {
    clerkOrganizationId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const organization = await ctx.db
        .query("organizations")
        .filter((q) =>
          q.eq(q.field("clerkOrganizationId"), args.clerkOrganizationId)
        )
        .first();

      return organization || null;
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
  handler: async (ctx, args): Promise<OrganizationsSchema> => {
    try {
      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .filter((q) =>
          q.eq(q.field("clerkOrganizationId"), args.clerkOrganizationId)
        )
        .first();

      if (!organization) {
        throw new Error(ErrorMessages.COMPANY_NOT_FOUND);
      }

      if (!organization.isActive) {
        throw new Error(ErrorMessages.COMPANY_INACTIVE);
      }

      return organization;
    } catch (error) {
      console.error(ErrorMessages.COMPANY_DB_QUERY_ERROR, error);
      throw new Error(ErrorMessages.COMPANY_DB_QUERY_ERROR);
    }
  },
});

export const updateOrganizationPromoDiscount = internalMutation({
  args: {
    clerkOrganizationId: v.string(),
    promoDiscount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { clerkOrganizationId, promoDiscount } = args;

    // Find the organization by clerkOrganizationId
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_clerkOrganizationId", (q) =>
        q.eq("clerkOrganizationId", clerkOrganizationId)
      )
      .first();

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Update the promoDiscount
    const updatedOrganization = await ctx.db.patch(organization._id, {
      promoDiscount: promoDiscount,
    });

    return updatedOrganization;
  },
});

export const getPromotersBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args): Promise<GetPromotersBySlugResponse> => {
    const { slug } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Moderator,
      ]);

      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .filter((q) => q.eq(q.field("slug"), slug))
        .first();

      const validatedOrganization = validateOrganization(organization);

      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

      const promoters = await ctx.db
        .query("users")
        .filter((q) =>
          q.eq(q.field("organizationId"), validatedOrganization._id)
        )
        .filter((q) => q.eq(q.field("role"), UserRole.Promoter))
        .collect();

      const formattedPromoters: Promoter[] = promoters.map((promoter) => ({
        prmoterUserId: promoter._id,
        name: promoter.name,
      }));

      return {
        status: ResponseStatus.SUCCESS,
        data: { promoters: formattedPromoters },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const getOrganizationImagePublic = query({
  args: {
    organizationName: v.string(),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_name", (q) => q.eq("name", args.organizationName))
      .first();

    if (!organization) {
      return null;
    }
    return organization.imageUrl;
  },
});

export const getOrganizationBySlug = internalQuery({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }): Promise<OrganizationsSchema | null> => {
    try {
      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      return organization;
    } catch (error) {
      console.error(ErrorMessages.ORGANIZATION_DB_QUERY_SLUG_ERROR, error);
      throw new Error(ErrorMessages.ORGANIZATION_DB_QUERY_SLUG_ERROR);
    }
  },
});

export const getUsersByOrganizationSlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args): Promise<GetUsersByOrganizationSlugResponse> => {
    const { slug } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx);

      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.COMPANY_NOT_FOUND,
        };
      }

      if (!organization.isActive) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.COMPANY_INACTIVE,
        };
      }

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
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const getOrganizationById = internalQuery({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, { organizationId }): Promise<OrganizationsSchema> => {
    try {
      const organization: OrganizationsSchema | null =
        await ctx.db.get(organizationId);

      if (!organization) {
        throw new Error(ErrorMessages.COMPANY_NOT_FOUND);
      }

      if (!organization.isActive) {
        throw new Error(ErrorMessages.COMPANY_INACTIVE);
      }

      return organization;
    } catch (error) {
      console.error(ErrorMessages.COMPANY_DB_QUERY_ID_ERROR, error);
      throw new Error(ErrorMessages.COMPANY_DB_QUERY_ID_ERROR);
    }
  },
});
