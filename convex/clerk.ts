"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import {
  GetPendingInvitationListResponse,
  PendingInvitationUser,
} from "@/types/types";
import {
  RoleConvex,
  SubscriptionStatusConvex,
  SubscriptionTierConvex,
} from "./schema";
import { internal } from "./_generated/api";
import {
  ErrorMessages,
  ShowErrorMessages,
  ResponseStatus,
  UserRole,
} from "@/types/enums";
import {
  RevokeOrganizationInvitationResponse,
  CreateOrganizationResponse,
  UpdateClerkOrganizationPhotoResponse,
  UpdateOrganizationMembershipsResponse,
  UpdateOrganizationNameResponse,
  CreateClerkInvitationResponse,
  UpdateOrganizationMetadataResponse,
  WebhookResponse,
} from "@/types/convex-types";
import { requireAuthenticatedUser } from "../utils/auth";
import slugify from "slugify";
import {
  clerkClient,
  clerkInviteUserToOrganization,
  createClerkOrg,
  revokeOrganizationInvitationHelper,
  updateClerkOrganization,
  updateClerkOrganizationMetadata,
  updateOrganizationLogo,
  updateOrganizationMembershipHelper,
} from "../utils/clerk";
import { handleError, isUserInOrganization } from "./backendUtils/helper";
import {
  handleOrganizationInvitationAccepted,
  handleUserCreated,
  handleUserUpdated,
  verifyClerkWebhook,
} from "./backendUtils/clerkWebhooks";
import {
  validateCustomer,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";

export const fulfill = internalAction({
  args: { headers: v.any(), payload: v.string() },
  handler: async (ctx, args): Promise<WebhookResponse> => {
    try {
      const payload = await verifyClerkWebhook(args.payload, args.headers);
      console.log("payload", payload);
      switch (payload.type) {
        case "user.created":
          await handleUserCreated(ctx, payload.data);
          break;
        case "user.updated":
          await handleUserUpdated(ctx, payload.data);
          break;
        case "organizationInvitation.accepted":
          await handleOrganizationInvitationAccepted(ctx, payload.data);
          break;
        default:
          console.log(`⚠️ Unhandled event type: ${payload.type}`);
      }
      return { success: true };
    } catch (err) {
      console.error(" Error processing Clerk webhook:", err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});

export const getPendingInvitationList = action({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args): Promise<GetPendingInvitationListResponse> => {
    const { clerkOrgId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx);

      isUserInOrganization(identity, clerkOrgId);

      const { data } =
        await clerkClient.organizations.getOrganizationInvitationList({
          organizationId: clerkOrgId,
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
      return handleError(error);
    }
  },
});

export const updateOrganizationMemberships = action({
  args: {
    role: RoleConvex,
    clerkUserId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<UpdateOrganizationMembershipsResponse> => {
    const { role, clerkUserId } = args;
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const user = validateUser(
        await ctx.runQuery(internal.users.internalFindUserByClerkId, {
          clerkUserId,
        })
      );

      const organization = validateOrganization(
        await ctx.runQuery(internal.organizations.getOrganizationById, {
          organizationId: user.organizationId!,
        })
      );

      const clerkOrgId = organization.clerkOrganizationId;
      isUserInOrganization(idenitity, clerkOrgId);

      await Promise.all([
        updateOrganizationMembershipHelper(clerkOrgId, clerkUserId, role),
        ctx.runMutation(internal.users.internalUpdateUserById, {
          clerkUserId,
          role: args.role,
        }),
      ]);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkUserId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const createClerkInvitation = action({
  args: {
    clerkOrgId: v.string(),
    role: RoleConvex,
    email: v.string(),
  },
  handler: async (ctx, args): Promise<CreateClerkInvitationResponse> => {
    const { clerkOrgId, role, email } = args;
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      isUserInOrganization(idenitity, clerkOrgId);

      const user = await ctx.runQuery(internal.users.findUserByEmail, {
        email,
      });

      if (user) {
        throw new Error(ShowErrorMessages.USER_ALREADY_EXISTS);
      }

      const response = await clerkInviteUserToOrganization(
        clerkOrgId,
        email,
        role
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkInvitationId: response.id,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const revokeOrganizationInvitation = action({
  args: {
    clerkOrgId: v.string(),
    clerkInvitationId: v.string(),
  },
  handler: async (ctx, args): Promise<RevokeOrganizationInvitationResponse> => {
    const { clerkOrgId, clerkInvitationId } = args;
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      isUserInOrganization(idenitity, clerkOrgId);

      await revokeOrganizationInvitationHelper(clerkInvitationId);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkInvitationId: args.clerkInvitationId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const createClerkOrganization = action({
  args: {
    companyName: v.string(),
    photo: v.union(v.id("_storage"), v.null()),
    promoDiscount: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args): Promise<CreateOrganizationResponse> => {
    const { companyName, photo } = args;
    let { promoDiscount } = args;

    promoDiscount = promoDiscount ?? 0;
    try {
      const identity = await requireAuthenticatedUser(ctx);
      const clerkUserId = identity.id as string;

      const user = await ctx.runQuery(
        internal.users.internalFindUserByClerkId,
        { clerkUserId }
      );

      if (user.organizationId) {
        throw new Error(ShowErrorMessages.USER_ALREADY_HAS_COMPANY);
      }

      if (!user.customerId) {
        throw new Error(ShowErrorMessages.USER_NOT_CUSTOMER);
      }

      const customer = validateCustomer(
        await ctx.runQuery(internal.customers.findCustomerById, {
          customerId: user.customerId,
        })
      );

      const existingOrganization = await ctx.runQuery(
        internal.organizations.getOrganizationByName,
        { name: companyName }
      );

      if (existingOrganization) {
        throw new Error(ShowErrorMessages.COMPANY_NAME_ALREADY_EXISTS);
      }

      const slug: string = slugify(companyName, { lower: true, strict: true });

      const clerkOrganization = await createClerkOrg({
        companyName,
        publicMetadata: {
          urlSlug: slug,
        },
        createdBy: clerkUserId,
      });

      const organizationId = await ctx.runMutation(
        internal.organizations.createConvexOrganization,
        {
          clerkOrganizationId: clerkOrganization.id,
          name: companyName,
          slug,
          promoDiscount,
          customerId: customer._id,
          photo,
          userId: user._id,
        }
      );

      if (photo) {
        const blob = await ctx.storage.get(photo);
        if (!blob) {
          console.error(ErrorMessages.FILE_CREATION_ERROR);
          return {
            status: ResponseStatus.SUCCESS,
            data: {
              organizationId,
              slug,
              clerkOrganizationId: organizationId,
            },
          };
        }
        await updateOrganizationLogo({
          organizationId: clerkOrganization.id,
          file: blob,
          uploaderUserId: clerkUserId,
        });
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          organizationId,
          slug,
          clerkOrganizationId: clerkOrganization.id,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const updateClerkOrganizationPhoto = action({
  args: {
    clerkOrganizationId: v.string(),
    photo: v.union(v.id("_storage"), v.null()),
  },
  handler: async (ctx, args): Promise<UpdateClerkOrganizationPhotoResponse> => {
    const { clerkOrganizationId, photo } = args;

    try {
      const idenitity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);
      const clerkUserId = idenitity.id as string;

      let blob: Blob | null = null;
      if (photo) {
        blob = await ctx.storage.get(photo);
        if (!blob) {
          console.error("Failed to get photo from storage");
          throw new Error(ErrorMessages.FILE_CREATION_ERROR);
        } else {
          await updateOrganizationLogo({
            organizationId: clerkOrganizationId,
            file: blob,
            uploaderUserId: clerkUserId,
          });
        }
      } else {
        console.log("No photo provided, skipping Clerk logo update");
      }

      await ctx.runMutation(internal.organizations.updateOrganization, {
        clerkOrganizationId,
        photo,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: { clerkOrganizationId },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const updateOrganizationName = action({
  args: {
    name: v.string(),
    clerkOrganizationId: v.string(),
  },
  handler: async (ctx, args): Promise<UpdateOrganizationNameResponse> => {
    const { name, clerkOrganizationId } = args;
    try {
      await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const slug: string = slugify(name, { lower: true, strict: true });

      const existingOrganization = await ctx.runQuery(
        internal.organizations.getOrganizationByName,
        { name }
      );

      if (existingOrganization) {
        throw new Error(ShowErrorMessages.COMPANY_NAME_ALREADY_EXISTS);
      }

      await Promise.all([
        updateClerkOrganization(clerkOrganizationId, name),
        ctx.runMutation(internal.organizations.updateOrganization, {
          clerkOrganizationId,
          name,
          slug,
        }),
      ]);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          slug,
        },
      };
    } catch (error) {
      return handleError(error);
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
  handler: async (ctx, args): Promise<UpdateOrganizationMetadataResponse> => {
    const { params, clerkOrganizationId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      isUserInOrganization(identity, clerkOrganizationId);

      await updateClerkOrganizationMetadata(clerkOrganizationId, params);

      if (params.promoDiscount !== undefined) {
        await ctx.runMutation(internal.organizations.updateOrganization, {
          clerkOrganizationId,
          promoDiscount: params.promoDiscount,
        });
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkOrgId: clerkOrganizationId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
