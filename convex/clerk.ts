"use node";

import type {
  OrganizationMembership,
  WebhookEvent,
} from "@clerk/clerk-sdk-node";
import { action, internalAction } from "./_generated/server";
import { Webhook } from "svix";
import { v } from "convex/values";
import { createClerkClient } from "@clerk/backend";
import {
  ClerkOrganization,
  CreateClerkInvitationResponse,
  Customer,
  DeleteClerkUserResponse,
  GetOrganizationMembershipsData,
  GetOrganizationMembershipsResponse,
  GetPendingInvitationListResponse,
  Membership,
  PendingInvitationUser,
  RevokeOrganizationInvitationResponse,
} from "@/types";
import {
  RoleConvex,
  SubscriptionStatusConvex,
  SubscriptionTierConvex,
} from "./schema";
import { internal } from "./_generated/api";
import { Organization } from "@clerk/nextjs/server";
import { ClerkRoleEnum, ErrorMessages } from "@/utils/enums";
import { ResponseStatus } from "../utils/enum";

export const fulfill = internalAction({
  args: { headers: v.any(), payload: v.string() },
  handler: async (ctx, args) => {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET as string);
    const payload = wh.verify(args.payload, args.headers) as WebhookEvent;
    return payload;
  },
});

export const getOrganizationMemberships = action({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args): Promise<GetOrganizationMembershipsResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const { data } =
        await clerkClient.organizations.getOrganizationMembershipList({
          organizationId: args.clerkOrgId,
        });
      const memberships: Membership[] = data.map((membership) => {
        const userData = membership.publicUserData;

        return {
          clerkUserId: userData ? userData.userId : "",
          role: membership.role,
          firstName: userData ? userData.firstName : "Unknown",
          lastName: userData ? userData.lastName : "Unknown",
          imageUrl: userData ? userData.imageUrl : "", // Default to empty string if not available
        };
      });
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          memberships,
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

export const getPendingInvitationList = action({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args): Promise<GetPendingInvitationListResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const { data } =
        await clerkClient.organizations.getOrganizationInvitationList({
          organizationId: args.clerkOrgId,
          status: ["pending"],
        });

      const users: PendingInvitationUser[] = data.map((invitation) => ({
        clerkInvitationId: invitation.id,
        email: invitation.emailAddress,
        role: invitation.role,
      }));
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          pendingInvitationUsers: users,
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

export const updateOrganizationMemberships = action({
  args: { clerkOrgId: v.string(), clerkUserId: v.string(), role: RoleConvex },
  handler: async (ctx, args) => {
    console.log("args", args);
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    try {
      await clerkClient.organizations.updateOrganizationMembership({
        organizationId: args.clerkOrgId,
        userId: args.clerkUserId,
        role: args.role,
      });
      await ctx.runMutation(internal.users.updateUserById, {
        clerkUserId: args.clerkUserId,
        role: args.role,
      });
      return { success: true, message: "Membership updated successfully." };
    } catch (err) {
      console.log("Failed to update organization membership: ", err);
      return { success: false, message: "Failed to update membership." };
    }
  },
});

export const deleteClerkUser = action({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args): Promise<DeleteClerkUserResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      await Promise.all([
        clerkClient.users.deleteUser(args.clerkUserId),
        ctx.runMutation(internal.users.deleteFromClerk, {
          clerkUserId: args.clerkUserId,
        }),
      ]);
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkUserId: args.clerkUserId,
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

export const createClerkInvitation = action({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    role: RoleConvex,
    email: v.string(),
  },
  handler: async (ctx, args): Promise<CreateClerkInvitationResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const response =
        await clerkClient.organizations.createOrganizationInvitation({
          organizationId: args.clerkOrgId,
          inviterUserId: args.clerkUserId,
          emailAddress: args.email,
          role: args.role,
        });
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkInvitationId: response.id,
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

export const revokeOrganizationInvitation = action({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    clerkInvitationId: v.string(),
  },
  handler: async (ctx, args): Promise<RevokeOrganizationInvitationResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      await clerkClient.organizations.revokeOrganizationInvitation({
        organizationId: args.clerkOrgId,
        invitationId: args.clerkInvitationId,
        requestingUserId: args.clerkUserId,
      });
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkInvitationId: args.clerkInvitationId,
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

export const createOrganization = action({
  args: {
    name: v.string(),
    clerkUserId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    try {
      const existingCustomer: Customer | null = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        {
          email: args.email,
        }
      );

      if (!existingCustomer) {
        throw new Error("Customer not found");
      }

      const org = await clerkClient.organizations.createOrganization({
        name: args.name,
        createdBy: args.clerkUserId,
        publicMetadata: {
          tier: existingCustomer.subscriptionTier,
          status: existingCustomer.subscriptionStatus,
        },
      });

      return org.id;
    } catch (err) {
      console.log("Failed to create organization", err);
      return null;
    }
  },
});

export const updateOrganization = action({
  args: {
    name: v.string(),
    clerkOrganizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    try {
      await clerkClient.organizations.updateOrganization(
        args.clerkOrganizationId,
        {
          name: args.name,
        }
      );
      return { success: true, message: "Organization Updated" };
    } catch (err) {
      console.log("Failed to update organization", err);
      return { success: false, message: "Failed to update organization." };
    }
  },
});

export const updateUserMetadata = action({
  args: {
    clerkUserId: v.string(),
    params: v.object({
      promoCode: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    try {
      await clerkClient.users.updateUserMetadata(args.clerkUserId, {
        publicMetadata: { ...args.params },
      });
      return { success: true, message: "MetaData Updated" };
    } catch (err) {
      console.log("Failed to update metadata", err);
      return { success: false, message: "Failed to update metadata." };
    }
  },
});

export const getOrganizationList = action({
  args: {},
  handler: async (ctx, args): Promise<ClerkOrganization[]> => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    try {
      const { data } = await clerkClient.organizations.getOrganizationList();
      const filteredOrganizations: ClerkOrganization[] = data.map((org) => ({
        clerkOrganizationId: org.id,
        name: org.name,
        imageUrl: org.imageUrl,
        publicMetadata: org.publicMetadata,
      }));
      return filteredOrganizations;
    } catch (err) {
      console.log("Failed to update metadata", err);
      throw new Error("Failed to fetch organization.");
    }
  },
});

export const updateOrganizationMetadata = action({
  args: {
    clerkOrganizationId: v.string(),
    params: v.object({
      status: v.optional(SubscriptionStatusConvex),
      tier: v.optional(SubscriptionTierConvex),
      promoDiscount: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    try {
      const currentOrganization =
        await clerkClient.organizations.getOrganization({
          organizationId: args.clerkOrganizationId,
        });
      const currentMetadata = currentOrganization.publicMetadata || {};

      const updatedMetadata = {
        ...currentMetadata,
        ...args.params, // This will include status, tier, and promoCodeAmount if provided
      };

      await clerkClient.organizations.updateOrganizationMetadata(
        args.clerkOrganizationId,
        {
          publicMetadata: updatedMetadata,
        }
      );
    } catch (err) {
      console.log("Failed to update metadata", err);
      return { success: false, message: "Failed to update metadata." };
    }
  },
});
