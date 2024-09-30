import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { query, QueryCtx } from "./_generated/server";
export const createOrganization = internalMutation({
  args: {
    clerkOrganizationId: v.string(),
    name: v.string(),
    clerkUserIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const organizationId = await ctx.db.insert("organizations", {
        clerkOrganizationId: args.clerkOrganizationId,
        name: args.name,
        clerkUserIds: args.clerkUserIds,
      });
      return organizationId;
    } catch (error) {
      console.error("Error inserting user into the database:", error);
      throw new Error("Failed to insert user");
    }
  },
});

export const addClerkUserId = internalMutation({
  args: {
    clerkOrganizationId: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Fetch the organization by its clerkOrganizationId
      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_clerkOrganizationId", (q) =>
          q.eq("clerkOrganizationId", args.clerkOrganizationId)
        )
        .first();

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Check if the clerkUserId is already present
      if (organization.clerkUserIds.includes(args.clerkUserId)) {
        throw new Error("User ID already exists in the organization");
      }

      // Push the new clerkUserId into the array
      const updatedClerkUserIds = [
        ...organization.clerkUserIds,
        args.clerkUserId,
      ];

      // Update the organization with the new clerkUserIds array
      await ctx.db.patch(organization._id, {
        clerkUserIds: updatedClerkUserIds,
      });

      return { success: true };
    } catch (error) {
      console.error("Error adding Clerk user ID to organization:", error);
      throw new Error("Failed to add Clerk user ID");
    }
  },
});

export const updateOrganization = internalMutation({
  args: {
    clerkOrganizationId: v.string(), // Use this to identify the organization
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()), // Optionally update the name
  },
  handler: async (ctx, args) => {
    try {
      const updateFields: any = {};

      const organization = await ctx.db
        .query("organizations")
        .withIndex("by_clerkOrganizationId", (q) =>
          q.eq("clerkOrganizationId", args.clerkOrganizationId)
        )
        .first();

      if (!organization) {
        throw new Error(
          `Organization with clerkOrganizationId ${args.clerkOrganizationId} not found.`
        );
      }

      // Update the organization in the database
      await ctx.db.patch(organization?._id, {
        name: args.name || organization.name,
        imageUrl: args.imageUrl || organization.imageUrl,
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating organization in the database:", error);
      throw new Error("Failed to update organization");
    }
  },
});

export const getOrganizationByName = internalQuery({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const organization = await ctx.db
        .query("organizations")
        .filter((q) => q.eq(q.field("name"), args.name))
        .first();

      if (organization) {
        return organization;
      }
      return null;
    } catch (error) {
      console.error("Error finding organization by ClerkId:", error);
      return null;
    }
  },
});

export const getAllOrganizations = query({
  handler: async (ctx: QueryCtx) => {
    try {
      const organizations = await ctx.db.query("organizations").collect(); // Collect all matching results

      return organizations.map((org) => ({
        clerkOrganizationId: org.clerkOrganizationId,
        name: org.name,
        imageUrl: org.imageUrl,
      }));
    } catch (error) {
      console.error("Error retrieving organizations:", error);
      return [];
    }
  },
});
