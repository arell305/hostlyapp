import { ErrorMessages, UserRole } from "@/types/enums";
import {
  OrganizationInvitationJSON,
  UserJSON,
  WebhookEvent,
} from "@clerk/backend";
import { GenericActionCtx } from "convex/server";
import { Webhook } from "svix";
import { internal } from "../_generated/api";

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

    if (existingCustomer) {
      await ctx.runMutation(internal.users.createUser, {
        email: data.email_addresses[0]?.email_address,
        clerkUserId: data.id,
        customerId: existingCustomer._id,
        role: UserRole.Admin,
        name: `${data.first_name} ${data.last_name}`.trim(),
        imageUrl: data.image_url,
      });
      return;
    }

    // Else create a new user
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
  try {
    const organization = await ctx.runQuery(
      internal.organizations.internalGetOrganizationByClerkId,
      { clerkOrganizationId: data.organization_id }
    );

    await ctx.runMutation(internal.users.updateUserByEmail, {
      email: data.email_address,
      role: data.role as UserRole,
      organizationId: organization._id,
    });
  } catch (err) {
    console.error("Error handling organizationInvitation.accepted:", err);
    throw new Error(ErrorMessages.CLERK_WEBHOOK_ORG_INV_ACCEPTED);
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
      throw new Error(ErrorMessages.CLERK_WEBHOOK_UPDATED_USER_NO_EMAIL);
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
