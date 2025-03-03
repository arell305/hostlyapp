import { UserIdentity } from "convex/server";
import { UserRole } from "../../utils/enum";
import { ErrorMessages } from "@/types/enums";
import { GuestListSchema } from "@/types/types";
import { EventSchema, UserSchema } from "@/types/schemas-types";

export function isUserInOrganization(
  identity: UserIdentity,
  clerkOrgId: string
): boolean {
  const allowedRoles = [UserRole.Hostly_Moderator, UserRole.Hostly_Admin];

  if (
    identity.clerk_org_id !== clerkOrgId &&
    !allowedRoles.includes(identity.role as UserRole)
  ) {
    throw new Error(ErrorMessages.FOBIDDEN_COMPANY);
  }

  return true;
}

export function isUserThePromoter(
  guestList: GuestListSchema,
  user: UserSchema
): boolean {
  if (user.role === UserRole.Hostly_Admin || UserRole.Hostly_Moderator) {
    return true;
  }
  if (guestList.userPromoterId !== user._id) {
    throw new Error(ErrorMessages.PROMOTER_NOT_BELONG_TO_GUEST_LIST);
  }
  return true;
}

export function isUserInCompanyOfEvent(
  user: UserSchema,
  event: EventSchema
): boolean {
  if (user.role === UserRole.Hostly_Admin || UserRole.Hostly_Moderator) {
    return true;
  }
  if (event.organizationId !== user.organizationId) {
    throw new Error(ErrorMessages.PROMOTER_NOT_BELONG_TO_COMPANY_OF_EVENT);
  }

  return true;
}
