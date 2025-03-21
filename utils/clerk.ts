import { ErrorMessages } from "@/types/enums";
import {
  Invitation,
  OrganizationInvitation,
  OrganizationMembership,
  WebhookEvent,
  createClerkClient,
} from "@clerk/backend";
import { getBaseUrl } from "./helpers";
import { Organization } from "@clerk/nextjs/server";
import { Webhook } from "svix";

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
    });

    return invitation;
  } catch (error) {
    console.error(ErrorMessages.CLERK_INVITATION_ERROR, error);
    throw new Error(ErrorMessages.CLERK_INVITATION_ERROR);
  }
}

export async function createClerkOrg({
  companyName,
  publicMetadata,
  createdBy,
}: {
  companyName: string;
  publicMetadata: Record<string, any>;
  createdBy: string;
}): Promise<Organization> {
  try {
    return await clerkClient.organizations.createOrganization({
      name: companyName,
      publicMetadata,
      createdBy,
    });
  } catch (error) {
    console.error(ErrorMessages.CLERK_ORGANIZATION_CREATE_ERROR, error);
    throw error;
  }
}

export async function updateOrganizationLogo({
  organizationId,
  file,
  uploaderUserId,
}: {
  organizationId: string;
  file: File | Blob;
  uploaderUserId: string;
}): Promise<Organization> {
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
): Promise<Organization> {
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
): Promise<Organization> {
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
  console.log("role", role);
  try {
    const response = await fetch(
      `https://api.clerk.com/v1/organizations/${clerkOrgId}/invitations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`, // Use your Clerk API key
        },
        body: JSON.stringify({
          email_address: email,
          role,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create invitation: ${await response.text()}`);
    }

    return response.json();
  } catch (error) {
    console.error(ErrorMessages.CLERK_INVITATION_ERROR, error);
    throw new Error(ErrorMessages.CLERK_INVITATION_ERROR);
  }
}

export async function revokeOrganizationInvitationHelper(
  invitationId: string
): Promise<OrganizationInvitation> {
  try {
    const response = await fetch(
      `https://api.clerk.com/v1/organizations/invitations/${invitationId}/revoke`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to revoke invitation: ${await response.text()}`);
    }

    return response.json();
  } catch (error) {
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
