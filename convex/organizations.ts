import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { ResponseStatus, UserRole } from "../utils/enum";
import {
  OrganizationsSchema,
  Promoter,
  UserSchema,
  getPromotersByOrganizationResponse,
} from "@/types/types";
import { ErrorMessages } from "@/types/enums";
import {
  CreateOrganizationResponse,
  GetAllOrganizationsResponse,
  GetOrganizationByNameQueryResponse,
  ListOrganizations,
} from "@/types/convex-types";
import slugify from "slugify";
import { Id } from "./_generated/dataModel";

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

// export const addClerkUserId = internalMutation({
//   args: {
//     clerkOrganizationId: v.string(),
//     clerkUserId: v.string(),
//   },
//   handler: async (ctx, args) => {
//     try {
//       // Fetch the organization by its clerkOrganizationId
//       const organization = await ctx.db
//         .query("organizations")
//         .withIndex("by_clerkOrganizationId", (q) =>
//           q.eq("clerkOrganizationId", args.clerkOrganizationId)
//         )
//         .first();

//       if (!organization) {
//         throw new Error("Organization not found");
//       }

//       // Check if the clerkUserId is already present
//       if (organization.clerkUserIds.includes(args.clerkUserId)) {
//         throw new Error("User ID already exists in the organization");
//       }

//       // Push the new clerkUserId into the array
//       const updatedClerkUserIds = [
//         ...organization.clerkUserIds,
//         args.clerkUserId,
//       ];

//       // Update the organization with the new clerkUserIds array
//       await ctx.db.patch(organization._id, {
//         clerkUserIds: updatedClerkUserIds,
//       });

//       return { success: true };
//     } catch (error) {
//       console.error("Error adding Clerk user ID to organization:", error);
//       throw new Error("Failed to add Clerk user ID");
//     }
//   },
// });

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
    name: v.string(),
  },
  handler: async (ctx, args): Promise<GetOrganizationByNameQueryResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .filter((q) => q.eq(q.field("name"), args.name))
        .first();
      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }
      // const isHostlyAdmin = checkIsHostlyAdmin(identity.role as string);

      // if (
      //   organization.clerkOrganizationId !==
      //     (identity.clerk_org_id as string) &&
      //   !isHostlyAdmin
      // ) {
      //   return {
      //     status: ResponseStatus.ERROR,
      //     data: null,
      //     error: ErrorMessages.FORBIDDEN,
      //   };
      // }
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
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const organizations: OrganizationsSchema[] = await ctx.db
        .query("organizations")
        .collect();

      const returnedData: ListOrganizations[] = organizations.map((org) => ({
        clerkOrganizationId: org.clerkOrganizationId,
        name: org.name,
        imageUrl: org.imageUrl,
      }));

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          organizations: returnedData,
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

// export const updateOrganizationPromoDiscount = mutation({
//   args: {
//     clerkOrganizationId: v.string(),
//     promoDiscount: v.optional(v.number()),
//   },
//   handler: async (ctx, args) => {
//     const { clerkOrganizationId, promoDiscount } = args;

//     // Find the organization by clerkOrganizationId
//     const organization = await ctx.db
//       .query("organizations")
//       .withIndex("by_clerkOrganizationId", (q) =>
//         q.eq("clerkOrganizationId", clerkOrganizationId)
//       )
//       .first();

//     if (!organization) {
//       throw new Error("Organization not found");
//     }

//     // Update the promoDiscount
//     const updatedOrganization = await ctx.db.patch(organization._id, {
//       promoDiscount: promoDiscount,
//     });

//     return updatedOrganization;
//   },
// });

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

export const getPromotersByOrganization = query({
  args: { clerkOrganizationId: v.string() },

  handler: async (ctx, args): Promise<getPromotersByOrganizationResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      if (identity.clerk_org_id !== args.clerkOrganizationId) {
        return {
          status: ResponseStatus.ERROR,
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

// export const getEventsForCalendar = query({
//   args: {name: v.string()},
//   handler: async (ctx, args): Promise<getPromotersByOrganizationResponse> => {
//     try {
//       const identity = await ctx.auth.getUserIdentity();
//       if (!identity) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.UNAUTHENTICATED,
//         };
//       }

//       const organization: OrganizationsSchema | null = await ctx.db
//       .query("organizations")
//       .filter((q) => q.eq(q.field("name"), args.name))
//       .first();

//       if (!organization) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }

//       const isHostlyAdmin = checkIsHostlyAdmin(identity.role as string);

//       if (identity.clerk_org_id !== organization.clerkOrganizationId && !isHostlyAdmin) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.FORBIDDEN,
//         };
//       }

//       // validate user belongs to org

//     }
//   }
// })

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
