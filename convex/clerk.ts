"use node";

import { action, internalAction } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { PendingInvitationUser } from "@/shared/types/types";
import {
  RoleConvex,
  SubscriptionStatusConvex,
  SubscriptionTierConvex,
} from "./schema";
import { internal } from "./_generated/api";
import {
  ErrorMessages,
  ShowErrorMessages,
  UserRole,
} from "@/shared/types/enums";
import {
  CreateOrganizationData,
  WebhookResponse,
} from "@/shared/types/convex-types";
import { requireAuthenticatedUser } from "../shared/utils/auth";
import slugify from "slugify";
import {
  clerkClient,
  clerkInviteUserToOrganization,
  createClerkOrg,
  revokeOrganizationInvitationHelper,
  updateClerkOrganization,
  updateClerkOrganizationMetadata,
  updateClerkUserPublicMetadata,
  updateOrganizationLogo,
} from "../shared/utils/clerk";
import {
  getActingClerkUserId,
  isUserInOrganization,
} from "./backendUtils/helper";
import {
  handleOrganizationInvitationAccepted,
  handleUserCreated,
  handleUserUpdated,
  verifyClerkWebhook,
} from "./webhooks/clerkWebhooks";
import {
  validateCustomer,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import { Id } from "./_generated/dataModel";

export const fulfill = internalAction({
  args: { headers: v.any(), payload: v.string() },
  handler: async (ctx, args): Promise<WebhookResponse> => {
    try {
      const payload = await verifyClerkWebhook(args.payload, args.headers);
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
  handler: async (ctx, args): Promise<PendingInvitationUser[]> => {
    const { clerkOrgId } = args;
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
      role: invitation.publicMetadata.role as UserRole,
    }));
    return users;
  },
});

export const createClerkInvitation = action({
  args: {
    clerkOrgId: v.string(),
    role: RoleConvex,
    email: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { clerkOrgId, role, email } = args;
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

    await ctx.runQuery(
      internal.organizations.internalGetOrganizationByClerkId,
      {
        clerkOrganizationId: clerkOrgId,
      }
    );

    if (user?.isActive) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: ShowErrorMessages.USER_ALREADY_EXISTS,
      });
    }

    await clerkInviteUserToOrganization(clerkOrgId, email, role);

    return true;
  },
});

export const revokeOrganizationInvitation = action({
  args: {
    clerkOrgId: v.string(),
    clerkInvitationId: v.string(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { clerkOrgId, clerkInvitationId, organizationId } = args;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Manager,
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
    ]);

    isUserInOrganization(identity, clerkOrgId);
    let clerkUserId = await getActingClerkUserId(ctx, identity, organizationId);

    await revokeOrganizationInvitationHelper(
      clerkInvitationId,
      clerkOrgId,
      clerkUserId
    );

    return true;
  },
});

export const createClerkOrganization = action({
  args: {
    companyName: v.string(),
    photo: v.union(v.id("_storage"), v.null()),
    promoDiscount: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args): Promise<CreateOrganizationData> => {
    const { companyName, photo } = args;
    let { promoDiscount } = args;

    promoDiscount = promoDiscount ?? 0;

    const identity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
    const convexUserId = identity.convexUserId as Id<"users">;

    const user = validateUser(
      await ctx.runQuery(internal.users.getUserByIdInternal, {
        userId: convexUserId,
      })
    );

    if (user.organizationId) {
      throw new ConvexError({
        code: "CONFLICT",
        message: ShowErrorMessages.USER_ALREADY_HAS_COMPANY,
      });
    }

    if (!user.customerId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: ShowErrorMessages.USER_NOT_CUSTOMER,
      });
    }

    if (!user.clerkUserId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: ShowErrorMessages.USER_NOT_CLERK_USER,
      });
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
      throw new ConvexError({
        code: "CONFLICT",
        message: ShowErrorMessages.COMPANY_NAME_ALREADY_EXISTS,
      });
    }

    const clerkUserId = user.clerkUserId;

    const clerkOrganization = await createClerkOrg({
      companyName,
      createdBy: clerkUserId,
    });

    const organizationId = await ctx.runMutation(
      internal.organizations.createConvexOrganization,
      {
        clerkOrganizationId: clerkOrganization.id,
        name: companyName,
        slug: clerkOrganization.slug,
        promoDiscount,
        customerId: customer._id,
        photo,
        userId: user._id,
      }
    );

    await updateClerkUserPublicMetadata(user.clerkUserId!, {
      convexSlug: clerkOrganization.slug,
      convexOrgId: organizationId,
    });

    if (photo) {
      const blob = await ctx.storage.get(photo);
      if (!blob) {
        console.error(ErrorMessages.FILE_CREATION_ERROR);
        return {
          organizationId,
          slug: clerkOrganization.slug,
          clerkOrganizationId: organizationId,
        };
      }
      await updateOrganizationLogo({
        organizationId: clerkOrganization.id,
        file: blob,
        uploaderUserId: clerkUserId,
      });
    }

    return {
      organizationId,
      slug: clerkOrganization.slug,
      clerkOrganizationId: clerkOrganization.id,
    };
  },
});

export const updateClerkOrganizationPhoto = action({
  args: {
    organizationId: v.id("organizations"),
    photo: v.union(v.id("_storage"), v.null()),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { organizationId, photo } = args;

    const idenitity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Manager,
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
    ]);

    const organization = validateOrganization(
      await ctx.runQuery(internal.organizations.getOrganizationById, {
        organizationId,
      })
    );

    isUserInOrganization(idenitity, organization.clerkOrganizationId);

    const clerkUserId = idenitity.id as string;

    let blob: Blob | null = null;
    if (photo) {
      blob = await ctx.storage.get(photo);
      if (!blob) {
        console.error("Failed to get photo from storage");
        throw new Error(ErrorMessages.FILE_CREATION_ERROR);
      } else {
        await updateOrganizationLogo({
          organizationId: organization.clerkOrganizationId,
          file: blob,
          uploaderUserId: clerkUserId,
        });
      }
    } else {
      console.log("No photo provided, skipping Clerk logo update");
    }

    await ctx.runMutation(internal.organizations.updateOrganizationById, {
      organizationId,
      updates: {
        photo,
      },
    });

    return true;
  },
});

export const updateOrganizationName = action({
  args: {
    name: v.string(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args): Promise<{ slug: string }> => {
    const { name, organizationId } = args;

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

    const organization = validateOrganization(
      await ctx.runQuery(internal.organizations.getOrganizationById, {
        organizationId,
      })
    );

    const users = await ctx.runQuery(internal.users.getUsersByOrganizationId, {
      organizationId,
    });

    await Promise.all([
      updateClerkOrganization(organization.clerkOrganizationId, name),
      ctx.runMutation(internal.organizations.updateOrganizationById, {
        organizationId,
        updates: { name, slug },
      }),
      ...users
        .filter((user) => user.clerkUserId)
        .map((user) =>
          updateClerkUserPublicMetadata(user.clerkUserId!, { convexSlug: slug })
        ),
    ]);

    return { slug };
  },
});

export const updateOrganizationMetadata = action({
  args: {
    organizationId: v.id("organizations"),
    params: v.object({
      status: v.optional(SubscriptionStatusConvex),
      tier: v.optional(SubscriptionTierConvex),
      promoDiscount: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { params, organizationId } = args;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Admin,
      UserRole.Manager,
      UserRole.Hostly_Moderator,
      UserRole.Hostly_Admin,
    ]);

    const organization = validateOrganization(
      await ctx.runQuery(internal.organizations.getOrganizationById, {
        organizationId,
      })
    );

    isUserInOrganization(identity, organization.clerkOrganizationId);

    await updateClerkOrganizationMetadata(
      organization.clerkOrganizationId,
      params
    );

    if (params.promoDiscount !== undefined) {
      await ctx.runMutation(internal.organizations.updateOrganizationById, {
        organizationId,
        updates: {
          promoDiscount: params.promoDiscount,
        },
      });
    }
    return true;
  },
});
