import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { query } from "./_generated/server";
import {
  OrganizationDetails,
  Promoter,
  UserSchema,
  OrganizationSchema,
  UserWithPromoCode,
} from "@/types/types";
import {
  ErrorMessages,
  StripeAccountStatus,
  ResponseStatus,
  UserRole,
} from "@/types/enums";
import {
  GetAllOrganizationsResponse,
  GetOrganizationByClerkUserIdResponse,
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
  validateUser,
} from "./backendUtils/validation";
import {
  ConnectedAccountsSchema,
  EventSchema,
  EventTicketTypesSchema,
  EventWithTicketTypes,
  PromoterPromoCodeSchema,
} from "@/types/schemas-types";

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

export const getOrganizationByClerkUserId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args): Promise<GetOrganizationByClerkUserIdResponse> => {
    const { clerkUserId } = args;
    try {
      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .unique()
      );

      let organization: OrganizationSchema | null = null;

      if (user.organizationId) {
        organization = await ctx.db.get(user.organizationId);
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          organization,
        },
      };
    } catch (error) {
      return handleError(error);
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
  args: { organizationId: v.id("organizations"), isActive: v.boolean() },

  handler: async (ctx, args): Promise<GetUsersByOrganizationSlugResponse> => {
    const { organizationId, isActive } = args;
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
        .filter((q) => q.eq(q.field("isActive"), isActive))
        .collect();

      const sortedUsers = users.sort((a, b) => {
        const nameA = a.name?.toLowerCase() || "";
        const nameB = b.name?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkOrganizationId: organization.clerkOrganizationId,
          users: sortedUsers,
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
  args: { slug: v.string() },
  handler: async (ctx, { slug }): Promise<GetOrganizationContextResponse> => {
    try {
      const identity = await requireAuthenticatedUser(ctx);
      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), identity.id))
        .unique();

      if (!user) {
        throw new Error(ErrorMessages.USER_NOT_FOUND);
      }

      if (!user.organizationId) {
        throw new Error(ErrorMessages.USER_NO_COMPANY);
      }

      if (!user.isActive) {
        throw new Error(ErrorMessages.USER_INACTIVE);
      }

      // Preload promoter promo (only if promoter)
      let userWithPromoCode: UserWithPromoCode | null = user;
      if (user.role === UserRole.Promoter) {
        const promoterPromoCode: PromoterPromoCodeSchema | null = await ctx.db
          .query("promoterPromoCode")
          .filter((q) => q.eq(q.field("promoterUserId"), user._id))
          .unique();

        userWithPromoCode = {
          ...user,
          promoCode: promoterPromoCode?.name ?? null,
          promoCodeId: promoterPromoCode?._id,
        };
      }

      const organization = validateOrganization(
        await ctx.db
          .query("organizations")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first()
      );

      isUserInOrganization(identity, organization.clerkOrganizationId);

      const subscription = validateSubscription(
        await ctx.db
          .query("subscriptions")
          .withIndex("by_customerId", (q) =>
            q.eq("customerId", organization.customerId)
          )
          .first()
      );

      const guestListCreditBalance = await ctx.db
        .query("organizationCredits")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", organization._id)
        )
        .unique();

      const availableCredits = guestListCreditBalance
        ? guestListCreditBalance.totalCredits -
          guestListCreditBalance.creditsUsed
        : 0;

      const connectedAccount: ConnectedAccountsSchema | null = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) =>
          q.eq("customerId", organization.customerId)
        )
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
          subscription,
          availableCredits,
          user: userWithPromoCode, // <-- only non-null for promoters
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

      const now = Date.now();

      const events: EventSchema[] = await ctx.db
        .query("events")
        .withIndex("by_organizationId_and_startTime", (q) =>
          q.eq("organizationId", organization._id)
        )
        .filter((q) => q.gt(q.field("endTime"), now))
        .filter((q) => q.eq(q.field("isActive"), true))
        .order("asc")
        .collect();

      const eventIds = events.map((event) => event._id);

      const ticketTypes: EventTicketTypesSchema[] = await ctx.db
        .query("eventTicketTypes")
        .filter((q) =>
          q.or(...eventIds.map((id) => q.eq(q.field("eventId"), id)))
        )
        .collect();

      const ticketMap = new Map<string, EventTicketTypesSchema[]>();
      ticketTypes.forEach((ticket) => {
        const list = ticketMap.get(ticket.eventId) ?? [];
        list.push(ticket);
        ticketMap.set(ticket.eventId, list);
      });

      const enrichedEvents: EventWithTicketTypes[] = events.map((event) => ({
        ...event,
        ticketTypes: ticketMap.get(event._id) ?? [],
      }));

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
            events: enrichedEvents,
          },
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const updateOrganizationById = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    updates: v.object({
      name: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      photo: v.optional(v.union(v.id("_storage"), v.null())),
      promoDiscount: v.optional(v.number()),
      slug: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args): Promise<Id<"organizations">> => {
    const { organizationId, updates } = args;
    try {
      const patch: Record<string, unknown> = {};

      if (updates.name !== undefined) {
        patch.name = updates.name;
      }

      if (updates.isActive !== undefined) {
        patch.isActive = updates.isActive;
      }

      if (updates.photo !== undefined) {
        patch.photo = updates.photo;
      }

      if (updates.promoDiscount !== undefined) {
        patch.promoDiscount = updates.promoDiscount;
      }

      if (updates.slug !== undefined) {
        patch.slug = updates.slug;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(organizationId, patch);
      }
      return organizationId;
    } catch (error) {
      console.error(ErrorMessages.COMPANY_DB_UPDATE_ERROR, error);
      throw new Error(ErrorMessages.COMPANY_DB_UPDATE_ERROR);
    }
  },
});

export const getAdminByOrganizationInternal = internalQuery({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args): Promise<UserSchema | null> => {
    try {
      // finding specific Convex ID for Hostly Admin Organization
      const roleToFind =
        args.organizationId === "jn75fk6mk1ttj02sjj3831c7an7n71sh"
          ? UserRole.Hostly_Admin
          : UserRole.Admin;

      const adminUser = await ctx.db
        .query("users")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .filter((q) => q.eq(q.field("role"), roleToFind))
        .first();

      return adminUser;
    } catch (error) {
      console.error(ErrorMessages.COMPANY_DB_QUERY_FOR_ADMIN_ERROR, error);
      throw new Error(ErrorMessages.COMPANY_DB_QUERY_FOR_ADMIN_ERROR);
    }
  },
});
