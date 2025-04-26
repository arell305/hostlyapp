import { FrontendErrorMessages } from "@/types/enums";
import { isValidEmail } from "../helpers";

export const validateInviteForm = (
  email: string,
  inviteRole: string
): { email?: string; role?: string } => {
  const errors: { email?: string; role?: string } = {};

  if (!isValidEmail(email)) {
    errors.email = FrontendErrorMessages.EMAIL_REQUIRED;
  }

  if (!inviteRole) {
    errors.role = FrontendErrorMessages.ROLE_REQUIRED;
  }

  return errors;
};
