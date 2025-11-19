import { ErrorMessages, UserRole } from "@/shared/types/enums";
import {
  OrganizationInvitationJSON,
  UserJSON,
  WebhookEvent,
} from "@clerk/backend";
import { GenericActionCtx } from "convex/server";
import { Webhook } from "svix";
import { internal } from "../_generated/api";
import { updateClerkUserPublicMetadata } from "@/shared/utils/clerk";
import { validateUser } from "../backendUtils/validation";
import { Doc } from "../_generated/dataModel";
import { retryUntil } from "../backendUtils/utils";

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
  if (!data.primary_email_address_id) {
    throw new Error(
      "Clerk user.created webhook: missing primary_email_address_id"
    );
  }

  const primaryEmailObj = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  );

  if (!primaryEmailObj) {
    throw new Error(
      `Primary email ID ${data.primary_email_address_id} not found in email_addresses array`
    );
  }

  const primaryEmail = primaryEmailObj.email_address;
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");

  try {
    const existingCustomer = await ctx.runQuery(
      internal.customers.findCustomerByEmail,
      { email: primaryEmail }
    );

    if (existingCustomer) {
      // Customer exists → this is likely an admin/invited user
      const convexUserId = await ctx.runMutation(internal.users.createUser, {
        email: primaryEmail,
        clerkUserId: data.id,
        customerId: existingCustomer._id,
        role: UserRole.Admin,
        name: fullName,
        imageUrl: data.image_url,
      });

      await updateClerkUserPublicMetadata(data.id, {
        convexUserId,
        role: UserRole.Admin,
      });

      return;
    }

    await ctx.runMutation(internal.users.createUser, {
      email: primaryEmail,
      clerkUserId: data.id,
      role: null,
      name: fullName,
      imageUrl: data.image_url,
    });
  } catch (err: any) {
    console.error("Error handling user.created webhook:", {
      clerkUserId: data.id,
      primaryEmail,
      error: err.message,
      stack: err.stack,
    });
    throw new Error("Failed to handle Clerk user creation");
  }
};

export const handleOrganizationInvitationAccepted = async (
  ctx: GenericActionCtx<any>,
  data: OrganizationInvitationJSON
) => {
  const { email_address, organization_id, public_metadata } = data;

  const user = await retryUntil(
    async () => {
      return await ctx.runQuery(internal.users.findUserByEmail, {
        email: email_address,
      });
    },
    {
      maxAttempts: 10,
      initialDelayMs: 300,
      baseDelayMs: 400,
      backoffMultiplier: 2,
      timeoutMessage: `User not found after retries: ${email_address}`,
    }
  );

  if (!user?.clerkUserId) {
    throw new Error(`User missing clerkUserId: ${email_address}`);
  }

  const organization = await ctx.runQuery(
    internal.organizations.internalGetOrganizationByClerkId,
    { clerkOrganizationId: organization_id }
  );

  if (!organization) {
    throw new Error(`Organization not found: ${organization_id}`);
  }

  await Promise.all([
    ctx.runMutation(internal.users.updateUserByEmail, {
      email: email_address,
      role: public_metadata.role as UserRole,
      organizationId: organization._id,
    }),
    updateClerkUserPublicMetadata(user.clerkUserId, {
      role: public_metadata.role as UserRole,
      convexSlug: organization.slug,
      convexUserId: user._id,
    }),
  ]);
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
