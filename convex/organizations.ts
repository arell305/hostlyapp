import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { query, QueryCtx } from "./_generated/server";
import { ResponseStatus, UserRole, UserRoleEnum } from "../utils/enum";
import { Promoter, getPromotersByOrganizationResponse } from "@/types";
import { ErrorMessages } from "@/utils/enums";

export const createOrganization = internalMutation({
  args: {
    clerkOrganizationId: v.string(),
    name: v.string(),
    clerkUserIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Get the first clerkUserId from the array
      const firstClerkUserId = args.clerkUserIds[0];

      if (!firstClerkUserId) {
        throw new Error("No user IDs provided for this organization");
      }

      // Query the user with the first clerkUserId
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", firstClerkUserId)
        )
        .first();

      if (!user || !user.customerId) {
        throw new Error(
          "No customer ID found for the first user in this organization"
        );
      }

      // Insert the organization with the customerId
      const organizationId = await ctx.db.insert("organizations", {
        clerkOrganizationId: args.clerkOrganizationId,
        name: args.name,
        clerkUserIds: args.clerkUserIds,
        eventIds: [],
        customerId: user.customerId,
        promoDiscount: 0,
      });

      return organizationId;
    } catch (error) {
      console.error("Error creating organization:", error);
      throw new Error("Failed to create organization");
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

export const getOrganizationByNameQuery = query({
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

// export const addEventToOrganization = mutation({
//   args: {
//     clerkOrganizationId: v.string(),
//     eventIds: v.id("events"),
//   },
//   handler: async (ctx, args) => {
//     try {
//       const organization = await ctx.db
//         .query("organizations")
//         .filter((q) =>
//           q.eq(q.field("clerkOrganizationId"), args.clerkOrganizationId)
//         )
//         .first();

//       if (!organization) {
//         throw new Error("Organization not found");
//       }

//       const updatedEvents = [...(organization.eventIds || []), args.eventIds];

//       // Update the organization by setting the new events array
//       await ctx.db.patch(organization._id, {
//         eventIds: updatedEvents,
//       });

//       return { success: true, message: "Event added successfully" };
//     } catch (error) {
//       console.error("Error adding event to organization:", error);
//       throw new Error("Could not add event");
//     }
//   },
// });

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

export const updateOrganizationPromoDiscount = mutation({
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

export const getPromotersByOrganization = query({
  args: { clerkOrganizationId: v.string() },

  handler: async (ctx, args): Promise<getPromotersByOrganizationResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      if (identity.clerk_org_id !== args.clerkOrganizationId) {
        return {
          status: ResponseStatus.UNAUTHORIZED,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const promoters = await ctx.db
        .query("users")
        .filter((q) =>
          q.eq(q.field("clerkOrganizationId"), args.clerkOrganizationId)
        )
        .filter((q) => q.eq(q.field("role"), UserRole.Promoter))
        .collect();
      const formattedPromoters: Promoter[] = promoters.map((promoter) => ({
        clerkUserId: promoter.clerkUserId,
        name: promoter.name,
      }));

      return {
        status: ResponseStatus.SUCCESS,
        data: formattedPromoters,
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
