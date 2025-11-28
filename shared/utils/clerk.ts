import { ErrorMessages, UserRole } from "@/shared/types/enums";
import {
  Invitation,
  OrganizationInvitation,
  OrganizationMembership,
  createClerkClient,
} from "@clerk/backend";
import { getBaseUrl } from "./helpers";
import slugify from "slugify";
import { throwConvexError } from "@/convex/backendUtils/errors";

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error(ErrorMessages.ENV_NOT_SET_CLERK_SECRET_KEY);
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function sendClerkInvitation(email: string): Promise<Invitation> {
  const baseUrl = getBaseUrl();
  const redirectUrl = `${baseUrl}/accept-invite`;
  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      ignoreExisting: true,
      redirectUrl,
      publicMetadata: {
        role: UserRole.Admin,
      },
    });

    return invitation;
  } catch (error) {
    console.error(ErrorMessages.CLERK_INVITATION_ERROR, error);
    throw new Error(ErrorMessages.CLERK_INVITATION_ERROR);
  }
}

export async function createClerkOrg({
  companyName,
  createdBy,
}: {
  companyName: string;
  createdBy: string;
}): Promise<import("@clerk/backend").Organization> {
  const baseSlug = slugify(companyName, { lower: true, strict: true });
  let slug = baseSlug;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      const organization = await clerkClient.organizations.createOrganization({
        name: companyName,
        slug,
        createdBy,
      });
      return organization;
    } catch (error: any) {
      if (
        error.errors?.[0]?.code === "duplicate_record" ||
        error.errors?.[0]?.message?.includes("slug")
      ) {
        attempts++;
        slug = `${baseSlug}-${attempts}`; // → acme-co-1, acme-co-2
        continue;
      }
      console.error("Clerk org create error:", error);
      throw error;
    }
  }

  throw new Error("Could not generate unique slug after 10 attempts");
}

export async function updateOrganizationLogo({
  organizationId,
  file,
  uploaderUserId,
}: {
  organizationId: string;
  file: File | Blob;
  uploaderUserId: string;
}): Promise<import("@clerk/backend").Organization> {
  try {
    const response = await clerkClient.organizations.updateOrganizationLogo(
      organizationId,
      { file, uploaderUserId }
    );
    return response;
  } catch (error) {
    console.error(ErrorMessages.CLERK_SET_LOGO_ERROR, error);
    throw error;
  }
}

export async function updateClerkOrganization(
  clerkOrganizationId: string,
  name: string
): Promise<import("@clerk/backend").Organization> {
  try {
    const updatedOrganization =
      await clerkClient.organizations.updateOrganization(clerkOrganizationId, {
        name,
      });
    return updatedOrganization;
  } catch (error) {
    console.error(ErrorMessages.CLERK_ORGANIZATION_UPDATE_ERROR, error);
    throw new Error(ErrorMessages.CLERK_ORGANIZATION_UPDATE_ERROR);
  }
}

export async function updateClerkOrganizationMetadata(
  clerkOrganizationId: string,
  updatedMetadata: Record<string, any>
): Promise<import("@clerk/backend").Organization> {
  try {
    const organization = await clerkClient.organizations.getOrganization({
      organizationId: clerkOrganizationId,
    });
    const existingMetadata = organization.publicMetadata || {};
    const newMetadata = { ...existingMetadata, ...updatedMetadata };

    return await clerkClient.organizations.updateOrganizationMetadata(
      clerkOrganizationId,
      {
        publicMetadata: newMetadata,
      }
    );
  } catch (error) {
    console.error(
      ErrorMessages.CLERK_ORGANIZATION_METADATA_UPDATE_ERROR,
      error
    );
    throw new Error(ErrorMessages.CLERK_ORGANIZATION_METADATA_UPDATE_ERROR);
  }
}

export async function getOrganizationMembers(clerkOrgId: string) {
  try {
    const membershipList =
      await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: clerkOrgId,
      });

    return membershipList;
  } catch (error) {
    console.error(
      `Failed to fetch organization members for ${clerkOrgId}:`,
      error
    );
    throw new Error("Could not retrieve organization members.");
  }
}

export async function clerkInviteUserToOrganization(
  clerkOrgId: string,
  email: string,
  role: string
): Promise<OrganizationInvitation> {
  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(
      `https://api.clerk.com/v1/organizations/${clerkOrgId}/invitations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          email_address: email,
          role: "org:member",
          public_metadata: {
            role,
          },
          redirect_url: `${baseUrl}/accept-invite`,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to create invitation: ${await response.text()}`);
    }

    return response.json();
  } catch (error) {
    throwConvexError(error, {
      code: "INTERNAL_ERROR",
    });
  }
}

export async function revokeOrganizationInvitationHelper(
  invitationId: string,
  clerkOrganizationId: string,
  requestingUserId: string
): Promise<OrganizationInvitation> {
  try {
    const response =
      await clerkClient.organizations.revokeOrganizationInvitation({
        organizationId: clerkOrganizationId,
        invitationId,
        requestingUserId,
      });

    return response;
  } catch (error) {
    console.error(
      "Failed to revoke invitation:",
      JSON.stringify(error, null, 2)
    );
    console.error(ErrorMessages.CLERK_REVOKE_ERROR, error);
    throw new Error(ErrorMessages.CLERK_REVOKE_ERROR);
  }
}

export async function updateOrganizationMembershipHelper(
  clerkOrgId: string,
  clerkUserId: string,
  role: string
): Promise<OrganizationMembership> {
  try {
    const response =
      await clerkClient.organizations.updateOrganizationMembership({
        organizationId: clerkOrgId,
        userId: clerkUserId,
        role,
      });

    return response;
  } catch (error) {
    console.error(
      ErrorMessages.CLERK_ORGANIZATION_UPDATE_MEMBERSHIP_ERROR,
      error
    );
    throw new Error(ErrorMessages.CLERK_ORGANIZATION_UPDATE_MEMBERSHIP_ERROR);
  }
}

export async function updateClerkUserPublicMetadata(
  userId: string,
  newMetadata: Record<string, any>
): Promise<void> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const currentMetadata = user.publicMetadata || {};
    const mergedMetadata = { ...currentMetadata, ...newMetadata };

    await clerkClient.users.updateUser(userId, {
      publicMetadata: mergedMetadata,
    });
  } catch (error) {
    console.error(
      `Failed to update public metadata for user ${userId}:`,
      error
    );
    throw new Error(ErrorMessages.CLERK_USER_METADATA_UPDATE_ERROR);
  }
}
