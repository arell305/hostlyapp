import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { query } from "./_generated/server";
import {
  OrganizationDetails,
  OrganizationPublic,
  UserWithPromoCode,
} from "@/shared/types/types";
import {
  ErrorMessages,
  StripeAccountStatus,
  UserRole,
} from "@/shared/types/enums";
import { GetOrganizationContextData } from "@/shared/types/convex-types";
import { Doc, Id } from "./_generated/dataModel";
import { requireAuthenticatedUser } from "../shared/utils/auth";
import { isUserInOrganization } from "./backendUtils/helper";
import {
  validateOrganization,
  validateSubscription,
  validateUser,
} from "./backendUtils/validation";
import { EventWithTicketTypes } from "@/shared/types/schemas-types";

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
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_clerkOrganizationId", (q) =>
        q.eq("clerkOrganizationId", args.clerkOrganizationId)
      )
      .first();

    if (!organization) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.COMPANY_NOT_FOUND,
      });
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

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(organization._id, updates);
    }

    return organization._id;
  },
});

export const getAllOrganizations = query({
  handler: async (ctx): Promise<OrganizationDetails[]> => {
    await requireAuthenticatedUser(ctx, [
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
    ]);

    const organizations = await ctx.db
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
    return organizationDetails;
  },
});

export const getOrganizationByClerkUserId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"organizations"> | null> => {
    const { clerkUserId } = args;

    const user = validateUser(
      await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
        .unique()
    );

    let organization: Doc<"organizations"> | null = null;

    if (user.organizationId) {
      organization = await ctx.db.get(user.organizationId);
    }

    return organization;
  },
});
export const internalGetOrganizationByClerkId = internalQuery({
  args: {
    clerkOrganizationId: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"organizations">> => {
    return validateOrganization(
      await ctx.db
        .query("organizations")
        .filter((q) =>
          q.eq(q.field("clerkOrganizationId"), args.clerkOrganizationId)
        )
        .first()
    );
  },
});

export const getOrganizationByName = internalQuery({
  args: { name: v.string() },
  handler: async (ctx, args): Promise<Doc<"organizations"> | null> => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const getUsersByOrganization = query({
  args: { organizationId: v.id("organizations"), isActive: v.boolean() },

  handler: async (ctx, args): Promise<Doc<"users">[]> => {
    const { organizationId, isActive } = args;
    const identity = await requireAuthenticatedUser(ctx);

    const organization = validateOrganization(await ctx.db.get(organizationId));

    isUserInOrganization(identity, organization.clerkOrganizationId);

    const users = await ctx.db
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

    return sortedUsers;
  },
});

export const getOrganizationById = internalQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args): Promise<Doc<"organizations">> => {
    return validateOrganization(await ctx.db.get(args.organizationId));
  },
});

export const getOrganizationContext = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }): Promise<GetOrganizationContextData> => {
    const identity = await requireAuthenticatedUser(ctx);

    const userId = identity.convexUserId as Id<"users">;

    const user = validateUser(await ctx.db.get(userId));

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.USER_NOT_FOUND,
      });
    }

    if (!user.organizationId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.USER_NO_COMPANY,
      });
    }

    if (!user.isActive) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.USER_INACTIVE,
      });
    }

    let userWithPromoCode: UserWithPromoCode | null = user;
    if (user.role === UserRole.Promoter) {
      const promoterPromoCode = await ctx.db
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
      ? guestListCreditBalance.totalCredits - guestListCreditBalance.creditsUsed
      : 0;

    const connectedAccount = await ctx.db
      .query("connectedAccounts")
      .withIndex("by_customerId", (q) =>
        q.eq("customerId", organization.customerId)
      )
      .first();

    return {
      organization,
      connectedAccountId: connectedAccount?.stripeAccountId ?? null,
      connectedAccountStatus: connectedAccount?.status ?? null,
      subscription,
      availableCredits,
      user: userWithPromoCode,
    };
  },
});

export const getPublicOrganizationContext = query({
  args: { slug: v.string() },
  handler: async (ctx, args): Promise<OrganizationPublic> => {
    const { slug } = args;

    const organization = validateOrganization(
      await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first()
    );

    const connectedAccount = await ctx.db
      .query("connectedAccounts")
      .withIndex("by_customerId", (q) =>
        q.eq("customerId", organization.customerId)
      )
      .first();

    const now = Date.now();

    const events = await ctx.db
      .query("events")
      .withIndex("by_organizationId_and_startTime", (q) =>
        q.eq("organizationId", organization._id)
      )
      .filter((q) => q.gt(q.field("endTime"), now))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();

    const eventIds = events.map((e) => e._id);

    const ticketTypes = await ctx.db
      .query("eventTicketTypes")
      .filter((q) =>
        q.or(...eventIds.map((id) => q.eq(q.field("eventId"), id)))
      )
      .collect();

    const ticketMap = new Map<string, Doc<"eventTicketTypes">[]>();
    ticketTypes.forEach((t) => {
      const list = ticketMap.get(t.eventId) ?? [];
      list.push(t);
      ticketMap.set(t.eventId, list);
    });

    const enrichedEvents: EventWithTicketTypes[] = events.map((event) => ({
      ...event,
      ticketTypes: ticketMap.get(event._id) ?? [],
    }));

    let photoUrl: string | null = null;
    if (organization.photo) {
      try {
        photoUrl = await ctx.storage.getUrl(organization.photo);
      } catch {
        photoUrl = null;
      }
    }

    return {
      id: organization._id,
      name: organization.name,
      photoUrl,
      connectedAccountStripeId: connectedAccount?.stripeAccountId,
      isStripeEnabled:
        connectedAccount?.status === StripeAccountStatus.VERIFIED,
      events: enrichedEvents,
      slug: organization.slug,
    };
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
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
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
  },
});

export const getUsersByOrgForMod = query({
  args: { organizationId: v.id("organizations") },

  handler: async (ctx, args): Promise<Doc<"users">[]> => {
    const { organizationId } = args;

    // Need to remove admin from here
    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
      UserRole.Admin,
    ]);

    const organization = validateOrganization(await ctx.db.get(organizationId));

    isUserInOrganization(identity, organization.clerkOrganizationId);

    const users = await ctx.db
      .query("users")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", organization._id)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const sortedUsers = users.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      return nameA.localeCompare(nameB);
    });

    return sortedUsers;
  },
});
