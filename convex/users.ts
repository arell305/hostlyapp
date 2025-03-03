import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { RoleConvex } from "./schema";
import {
  FindUserByClerkIdResponse,
  OrganizationsSchema,
  UserSchema,
  UserWithPromoCode,
} from "@/types/types";
import { ResponseStatus, UserRole } from "../utils/enum";
import { ErrorMessages } from "@/types/enums";
import { PromoterPromoCodeSchema } from "@/types/schemas-types";
import { Id } from "./_generated/dataModel";
import { requireAuthenticatedUser } from "../utils/auth";
import { isUserInOrganization } from "./backendUtils/helper";
import {
  GetUserByClerkIdResponse,
  UpdateUserByClerkIdResponse,
} from "@/types/convex-types";
import { validateUser } from "./backendUtils/validation";

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
    try {
      const userId = await ctx.db.insert("users", {
        clerkUserId: args.clerkUserId,
        email: args.email,
        organizationId: args.organizationId,
        isActive: true,
        customerId: args.customerId,
        role: args.role,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return userId;
    } catch (error) {
      console.error(ErrorMessages.USER_DB_CREATE_ERROR, error);
      throw new Error(ErrorMessages.USER_DB_CREATE_ERROR);
    }
  },
});

export const updateUser = internalMutation({
  args: {
    email: v.string(),
    clerkUserId: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
    newEmail: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (!user) {
        throw new Error(`User with email ${args.email} not found.`);
      }

      // Update the user with the provided fields
      await ctx.db.patch(user._id, {
        clerkUserId: args.clerkUserId || user.clerkUserId,
        organizationId: args.organizationId || user.organizationId,
        email: args.newEmail || user.email,
        name: args.name || user.name,
        imageUrl: args.imageUrl || user.imageUrl,
      });

      return user._id;
    } catch (error) {
      console.error("Error updating user in the database:", error);
      throw new Error("Failed to update user");
    }
  },
});

export const internalUpdateUserById = internalMutation({
  args: {
    email: v.optional(v.string()),
    clerkUserId: v.string(),
    organizationId: v.optional(v.id("organizations")),
    newEmail: v.optional(v.string()),
    role: v.optional(RoleConvex),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId)
        )
        .first();

      if (!user) {
        throw new Error(ErrorMessages.USER_NOT_FOUND);
      }

      await ctx.db.patch(user._id, {
        clerkUserId: args.clerkUserId || user.clerkUserId,
        organizationId: args.organizationId || user.organizationId,
        email: args.newEmail || user.email,
        role: args.role || user.role,
      });

      return user._id;
    } catch (error) {
      console.error(ErrorMessages.USER_DB_UPDATE_BY_ID_ERROR, error);
      throw new Error(ErrorMessages.USER_DB_UPDATE_BY_ID_ERROR);
    }
  },
});

export const updateUserByClerkId = mutation({
  args: {
    email: v.optional(v.string()),
    clerkUserId: v.string(),
    organizationId: v.optional(v.id("organizations")),
    newEmail: v.optional(v.string()),
    role: v.optional(RoleConvex),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<UpdateUserByClerkIdResponse> => {
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId)
        )
        .first();

      if (!user) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.USER_NOT_FOUND,
        };
      }

      if (!user.organizationId) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.USER_NO_COMPANY,
        };
      }

      const organization: OrganizationsSchema | null = await ctx.db.get(
        user.organizationId
      );

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

      isUserInOrganization(idenitity, organization.clerkOrganizationId);

      await ctx.db.patch(user._id, {
        clerkUserId: args.clerkUserId || user.clerkUserId,
        organizationId: args.organizationId || user.organizationId,
        email: args.newEmail || user.email,
        role: args.role || user.role,
        isActive: args.isActive || user.isActive,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkUserId: args.clerkUserId,
        },
      };
    } catch (error) {
      console.error(ErrorMessages.USER_DB_UPDATE_BY_ID_ERROR, error);
      throw new Error(ErrorMessages.USER_DB_UPDATE_BY_ID_ERROR);
    }
  },
});

export const findUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args): Promise<UserSchema | null> => {
    try {
      return await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
    } catch (error) {
      console.error(ErrorMessages.USER_DB_QUERY_BY_EMAIL_ERROR, error);
      throw new Error(ErrorMessages.USER_DB_QUERY_BY_EMAIL_ERROR);
    }
  },
});

export const findUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args): Promise<FindUserByClerkIdResponse> => {
    try {
      const idenitity = await requireAuthenticatedUser(ctx);
      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
        .unique();

      if (!user) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      if (!user.organizationId) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.USER_NO_COMPANY,
        };
      }

      const organization = await ctx.db.get(user.organizationId);

      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.COMPANY_NOT_FOUND,
        };
      }

      isUserInOrganization(idenitity, organization?.clerkOrganizationId);

      const promoterPromoCode: PromoterPromoCodeSchema | null = await ctx.db
        .query("promoterPromoCode")
        .filter((q) => q.eq(q.field("promoterUserId"), user._id))
        .unique();

      const data: UserWithPromoCode = {
        ...user,
        promoCode: promoterPromoCode?.name,
      };

      return {
        status: ResponseStatus.SUCCESS,
        data: { user: data },
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

export const internalFindUserByClerkId = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args): Promise<UserSchema> => {
    try {
      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
        .unique();

      if (!user) {
        throw new Error(ErrorMessages.USER_NOT_FOUND);
      }

      if (!user.isActive) {
        throw new Error(ErrorMessages.USER_INACTIVE);
      }

      return user;
    } catch (error) {
      console.error("error internalFindUserByClerkId, ", error);
      throw new Error(ErrorMessages.USER_INTERNAL_QUERY);
    }
  },
});

export const getUserByClerkId = query({
  args: {},
  handler: async (ctx): Promise<GetUserByClerkIdResponse> => {
    try {
      const identity = await requireAuthenticatedUser(ctx);
      const clerkUserId = identity.id as string;

      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
        .unique();

      const validatedUser = validateUser(user);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          user: validatedUser,
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
