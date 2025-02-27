import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { RoleConvex } from "./schema";
import {
  FindUserByClerkIdResponse,
  UserSchema,
  UserWithPromoCode,
} from "@/types/types";
import { ResponseStatus } from "../utils/enum";
import { ErrorMessages } from "@/types/enums";
import { PromoterPromoCodeSchema } from "@/types/schemas-types";
import { Id } from "./_generated/dataModel";

export const createUser = internalMutation({
  args: {
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    organizationId: v.optional(v.id("organizations")),
    customerId: v.optional(v.id("customers")),
    role: v.union(RoleConvex, v.null()),
    name: v.optional(v.string()),
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
      });
      return userId;
    } catch (error) {
      console.error("Error inserting user into the database:", error);
      throw new Error("Failed to insert user");
    }
  },
});

export const updateUser = internalMutation({
  args: {
    email: v.string(), // Use email to find the user
    clerkUserId: v.optional(v.string()), // Optional fields for updates
    organizationId: v.optional(v.id("organizations")),
    newEmail: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Find the user by email
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

export const updateUserById = internalMutation({
  args: {
    email: v.optional(v.string()), // Use email to find the user
    clerkUserId: v.string(), // Optional fields for updates
    organizationId: v.optional(v.id("organizations")),
    newEmail: v.optional(v.string()),
    acceptedInvite: v.optional(v.boolean()), // In case you want to update the email
    role: v.optional(RoleConvex),
  },
  handler: async (ctx, args) => {
    try {
      // Find the user by email
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId)
        )
        .first();

      if (!user) {
        throw new Error(`User with clerkUserId ${args.clerkUserId} not found.`);
      }

      // Update the user with the provided fields
      await ctx.db.patch(user._id, {
        clerkUserId: args.clerkUserId || user.clerkUserId,
        organizationId: args.organizationId || user.organizationId,
        email: args.newEmail || user.email,
        role: args.role || user.role,
      });

      return user._id;
    } catch (error) {
      console.error("Error updating user in the database:", error);
      throw new Error("Failed to update user");
    }
  },
});

export const findUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

export const findUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args): Promise<FindUserByClerkIdResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
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

      const promoterPromoCode: PromoterPromoCodeSchema | null = await ctx.db
        .query("promoterPromoCode")
        .filter((q) => q.eq(q.field("clerkPromoterUserId"), user.clerkUserId))
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

// delete
// export const updateUserWithPromoCode = mutation({
//   args: {
//     clerkUserId: v.string(),
//     promoCodeId: v.id("promoterPromoCode"),
//     promoCodeName: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const { clerkUserId, promoCodeId, promoCodeName } = args;

//     try {
//       const user = await ctx.db
//         .query("users")
//         .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
//         .unique();

//       if (!user) {
//         throw new Error("User not found");
//       }

//       await ctx.db.patch(user._id, {
//         promoterPromoCode: {
//           promoCodeId: promoCodeId,
//           name: promoCodeName,
//         },
//       });

//       return {
//         success: true,
//         message: "User updated with promo code successfully",
//       };
//     } catch (error) {
//       console.error("Error updating user with promo code:", error);
//       throw new Error(
//         `Failed to update user with promo code: ${error instanceof Error ? error.message : "Unknown error"}`
//       );
//     }
//   },
// });

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      throw new Error(`User with clerkUserId ${clerkUserId} not found.`);
    }
    try {
      await ctx.db.delete(user._id);
    } catch (err) {
      console.log("Failed to delete user", err);
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
