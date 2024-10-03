import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { UserRoleEnumConvex } from "./schema";

export const createUser = internalMutation({
  args: {
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    clerkOrganizationId: v.optional(v.string()),
    acceptedInvite: v.boolean(),
    customerId: v.optional(v.string()),
    role: UserRoleEnumConvex,
  },
  handler: async (ctx, args) => {
    try {
      const userId = await ctx.db.insert("users", {
        clerkUserId: args.clerkUserId,
        email: args.email,
        clerkOrganizationId: args.clerkOrganizationId,
        acceptedInvite: args.acceptedInvite,
        customerId: args.customerId,
        role: args.role,
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
    clerkOrganizationId: v.optional(v.string()),
    newEmail: v.optional(v.string()),
    acceptedInvite: v.optional(v.boolean()), // In case you want to update the email
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
        clerkOrganizationId:
          args.clerkOrganizationId || user.clerkOrganizationId,
        email: args.newEmail || user.email,
        acceptedInvite: args.acceptedInvite || user.acceptedInvite,
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
    clerkOrganizationId: v.optional(v.string()),
    newEmail: v.optional(v.string()),
    acceptedInvite: v.optional(v.boolean()), // In case you want to update the email
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
        clerkOrganizationId:
          args.clerkOrganizationId || user.clerkOrganizationId,
        email: args.newEmail || user.email,
        acceptedInvite: args.acceptedInvite || user.acceptedInvite,
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
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkUserId"), args.clerkUserId))
      .first();
  },
});
