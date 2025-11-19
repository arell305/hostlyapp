import { ConvexError, v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { RoleConvex } from "./schema";
import { UserWithPromoCode } from "@/shared/types/types";
import { Doc, Id } from "./_generated/dataModel";
import { requireAuthenticatedUser } from "../shared/utils/auth";
import { isUserInOrganization } from "./backendUtils/helper";
import { validateOrganization, validateUser } from "./backendUtils/validation";
import { ErrorMessages, UserRole } from "@/shared/types/enums";
import { retryUntil } from "./backendUtils/utils";
import { internal } from "./_generated/api";

export const createUser = internalMutation({
  args: {
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    organizationId: v.optional(v.id("organizations")),
    customerId: v.optional(v.id("customers")),
    role: v.union(RoleConvex, v.null()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"users">> => {
    return await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      email: args.email,
      organizationId: args.organizationId,
      isActive: true,
      customerId: args.customerId,
      role: args.role,
      name: args.name,
      imageUrl: args.imageUrl,
    });
  },
});

export const updateUserByEmail = internalMutation({
  args: {
    email: v.string(),
    organizationId: v.optional(v.id("organizations")),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(RoleConvex, v.null())),
    newEmail: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"users">> => {
    const user = validateUser(
      await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first()
    );

    await ctx.db.patch(user._id, {
      organizationId: args.organizationId ?? user.organizationId,
      email: args.newEmail ?? user.email,
      name: args.name ?? user.name,
      imageUrl: args.imageUrl ?? user.imageUrl,
      role: args.role ?? user.role,
      clerkUserId: args.clerkUserId ?? user.clerkUserId,
    });

    return user._id;
  },
});

export const internalUpdateUserById = internalMutation({
  args: {
    role: v.optional(RoleConvex),
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<Id<"users">> => {
    const { userId, role } = args;

    await ctx.db.patch(userId, {
      role: args.role || role,
    });

    return userId;
  },
});

export const findUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

export const findUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<UserWithPromoCode> => {
    const { userId } = args;
    const identity = await requireAuthenticatedUser(ctx);

    const user = validateUser(await ctx.db.get(userId), false, false, true);

    if (!user.organizationId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: ErrorMessages.USER_NO_COMPANY,
      });
    }

    const organization = validateOrganization(
      await ctx.db.get(user.organizationId)
    );
    isUserInOrganization(identity, organization.clerkOrganizationId);

    let promoCode: string | undefined;

    if (user.role === UserRole.Promoter) {
      const promoterPromoCode = await ctx.db
        .query("promoterPromoCode")
        .filter((q) => q.eq(q.field("promoterUserId"), user._id))
        .unique();

      promoCode = promoterPromoCode?.name;
    }

    const userWithPromoCode: UserWithPromoCode = {
      ...user,
      promoCode,
      isActive: user.isActive ?? false,
    };

    return userWithPromoCode;
  },
});

export const publicfindUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
      .unique();
  },
});

export const internalFindUserByClerkId = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args): Promise<Doc<"users">> => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: ErrorMessages.USER_NOT_FOUND,
      });
    }

    if (!user.isActive) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: ErrorMessages.USER_INACTIVE,
      });
    }

    return user;
  },
});

export const updateUserById = mutation({
  args: {
    userId: v.id("users"),
    update: v.object({
      role: v.optional(RoleConvex),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { userId, update } = args;

    const idenitity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Manager,
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
    ]);

    const user = validateUser(await ctx.db.get(userId), false, false, true);

    const organization = validateOrganization(
      await ctx.db.get(user.organizationId)
    );

    isUserInOrganization(idenitity, organization.clerkOrganizationId);

    await ctx.db.patch(user._id, {
      role: update.role ?? user.role,
      isActive: update.isActive ?? user.isActive,
    });

    return true;
  },
});

export const getUserByIdInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    const { userId } = args;
    return await ctx.db.get(userId);
  },
});

export const getUsersByOrganizationId = internalQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args): Promise<Doc<"users">[]> => {
    return await ctx.db
      .query("users")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();
  },
});

export const internalUpsertUserByClerkId = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    role: v.union(RoleConvex),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        organizationId: args.organizationId,
      });
    }

    return await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      email: args.email,
      role: args.role,
      organizationId: args.organizationId,
      isActive: true,
    });
  },
});

export const waitForUserSync = internalAction({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }): Promise<Doc<"users">> => {
    return await retryUntil(
      async () => {
        const user = await ctx.runQuery(
          internal.users.internalFindUserByClerkId,
          {
            clerkUserId,
          }
        );

        // Wait until user exists AND has organizationId
        if (user && user.organizationId && user.isActive) {
          return user;
        }
        return null;
      },
      {
        maxAttempts: 25,
        baseDelayMs: 600,
        initialDelayMs: 200,
        timeoutMessage:
          "Failed to sync user with organization. Please refresh.",
      }
    );
  },
});
