import { ErrorMessages } from "@/types/enums";
import { Invitation, createClerkClient } from "@clerk/backend";
import { getBaseUrl } from "./helpers";
import { Organization } from "@clerk/nextjs/server";

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
