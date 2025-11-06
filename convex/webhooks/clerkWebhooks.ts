import { ErrorMessages, UserRole } from "@/shared/types/enums";
import {
  OrganizationInvitationJSON,
  OrganizationMembershipJSON,
  UserJSON,
  WebhookEvent,
} from "@clerk/backend";
import { GenericActionCtx } from "convex/server";
import { Webhook } from "svix";
import { internal } from "../_generated/api";
import { updateClerkUserPublicMetadata } from "@/shared/utils/clerk";
import { Id } from "../_generated/dataModel";
import { validateUser } from "../backendUtils/validation";

export async function verifyClerkWebhook(
  payload: string,
  headers: Record<string, string>
): Promise<WebhookEvent> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Clerk webhook secret is not configured!");
    throw new Error(ErrorMessages.ENV_NOT_SET_CLERK_WEBHOOK);
  }

  try {
    const wh = new Webhook(secret);
    return wh.verify(payload, headers) as WebhookEvent;
  } catch (error) {
    console.error(" Clerk webhook verification failed:", error);
    throw new Error(ErrorMessages.CLERK_WEBHOOK_VERIFICATION_FAILED);
  }
}

export const handleUserCreated = async (
  ctx: GenericActionCtx<any>,
  data: UserJSON
) => {
  try {
    const existingCustomer = await ctx.runQuery(
      internal.customers.findCustomerByEmail,
      {
        email: data.email_addresses[0]?.email_address,
      }
    );

    let convexUserId: Id<"users"> | null = null;

    if (existingCustomer) {
      convexUserId = await ctx.runMutation(internal.users.createUser, {
        email: data.email_addresses[0]?.email_address,
        clerkUserId: data.id,
        customerId: existingCustomer._id,
        role: UserRole.Admin,
        name: `${data.first_name} ${data.last_name}`.trim(),
        imageUrl: data.image_url,
        isInvitationAccepted: true,
      });
      await updateClerkUserPublicMetadata(data.id, {
        convexUserId,
        role: UserRole.Admin,
      });
      return;
    }

    await ctx.runMutation(internal.users.createUser, {
      email: data.email_addresses[0]?.email_address,
      clerkUserId: data.id,
      role: null,
      name: `${data.first_name} ${data.last_name}`,
      imageUrl: data.image_url,
    });
  } catch (err) {
    console.error("Error handling user.created:", err);
    throw new Error(ErrorMessages.CLERK_WEBHHOOK_CREATE_USER);
  }
};

export const handleOrganizationInvitationAccepted = async (
  ctx: GenericActionCtx<any>,
  data: OrganizationInvitationJSON
) => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 500;

  const retry = async <T>(
    fn: () => Promise<T>,
    retries: number
  ): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      if (retries > 0) {
        await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
        return retry(fn, retries - 1);
      }
      throw err;
    }
  };

  try {
    const user = await retry(async () => {
      const fetchedUser = await ctx.runQuery(internal.users.findUserByEmail, {
        email: data.email_address,
      });
      return validateUser(fetchedUser);
    }, MAX_RETRIES);
    const organization = await ctx.runQuery(
      internal.organizations.internalGetOrganizationByClerkId,
      {
        clerkOrganizationId: data.organization_id,
      }
    );

    if (!organization) {
      console.error("Organization not found:", data.organization_id);
      return;
    }

    // USER READY → proceed
    await Promise.all([
      ctx.runMutation(internal.users.updateUserByEmail, {
        email: data.email_address,
        role: data.public_metadata.role as UserRole,
        organizationId: organization._id,
      }),
      updateClerkUserPublicMetadata(user.clerkUserId, {
        role: data.public_metadata.role,
        convexSlug: organization.slug,
        convexUserId: user._id,
      }),
    ]);
  } catch (err) {
    // Only throw on real errors (DB, network, etc.)
    console.error("Critical error in invitation webhook:", err);
    throw err; // Let Clerk retry
  }
};
export const handleUserUpdated = async (
  ctx: GenericActionCtx<any>,
  data: UserJSON
) => {
  try {
    const email = data.email_addresses[0]?.email_address;
    if (!email) {
      console.error("User updated event received without an email.");
    }

    await ctx.runMutation(internal.users.updateUserByEmail, {
      email,
      name: `${data.first_name} ${data.last_name}`.trim(),
      imageUrl: data.image_url,
    });
  } catch (err) {
    console.error(" Error handling user.updated:", err);
    throw new Error(ErrorMessages.CLERK_WEBHOOK_UPDATED_USER);
  }
};
export const handleOrganizationMembershipCreated = async (
  ctx: GenericActionCtx<any>,
  data: OrganizationMembershipJSON
) => {
  console.log("handleOrganizationMembershipCreated", data);
  const clerkOrgId = data.organization.id;
  const clerkUserId = data.public_user_data.user_id;

  const role = data.role as UserRole;

  const organization = await ctx.runQuery(
    internal.organizations.internalGetOrganizationByClerkId,
    { clerkOrganizationId: clerkOrgId }
  );

  if (!organization) {
    console.error("Organization not found in Convex:", clerkOrgId);
    return;
  }

  await ctx.runMutation(internal.users.internalUpsertUserByClerkId, {
    clerkUserId,
    email: data.public_user_data.identifier,
    role,
    organizationId: organization._id,
  });
};
