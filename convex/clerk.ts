"use node";

import type {
  OrganizationMembership,
  WebhookEvent,
} from "@clerk/clerk-sdk-node";
import { action, internalAction } from "./_generated/server";
import { Webhook } from "svix";
import { v } from "convex/values";
import { createClerkClient } from "@clerk/backend";
import { Membership, PendingInvitationUser } from "@/types";
import { RoleConvex } from "./schema";
import { internal } from "./_generated/api";

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
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    try {
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

      return memberships;
    } catch (err) {
      console.error("Failed to fetch organization members:", err);
      return [];
    }
  },
});

export const getPendingInvitationList = action({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    try {
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
      return users;
    } catch (err) {
      console.error("Failed to fetch organization members:", err);
      return [];
    }
  },
});

export const updateOrganizationMemberships = action({
  args: { clerkOrgId: v.string(), clerkUserId: v.string(), role: RoleConvex },
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    try {
      await clerkClient.organizations.updateOrganizationMembership({
        organizationId: args.clerkOrgId,
        userId: args.clerkUserId,
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
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    try {
      await clerkClient.users.deleteUser(args.clerkUserId);
      await ctx.runMutation(internal.users.deleteFromClerk, {
        clerkUserId: args.clerkUserId,
      });
      return { success: true, message: "User Deleted" };
    } catch (err) {
      console.log("Failed to delete user", err);
      return { success: false, message: "Failed to delete user." };
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
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    try {
      await clerkClient.organizations.createOrganizationInvitation({
        organizationId: args.clerkOrgId,
        inviterUserId: args.clerkUserId,
        emailAddress: args.email,
        role: args.role,
      });
      return { success: true, message: "User Invited" };
    } catch (err) {
      console.log("Failed to invite user", err);
      return { success: false, message: "Failed to invite user." };
    }
  },
});

export const revokeOrganizationInvitation = action({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    clerkInvitationId: v.string(),
  },
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    try {
      await clerkClient.organizations.revokeOrganizationInvitation({
        organizationId: args.clerkOrgId,
        invitationId: args.clerkInvitationId,
        requestingUserId: args.clerkUserId,
      });
      return { success: true, message: "Invitation Revoked" };
    } catch (err) {
      console.log("Failed to revoke user", err);
      return { success: false, message: "Failed to revoke user." };
    }
  },
});
