import { FrontendErrorMessages } from "@/types/enums";
import { isValidPhoneNumber } from "../frontend-validation";

interface ValidatePublicGuestListFormParams {
  name: string;
  phoneNumber: string;
}

interface PublicGuestListValidationResult {
  errors: {
    name?: string;
    phoneNumber?: string;
  };
  isValid: boolean;
}

export function validatePublicGuestListForm({
  name,
  phoneNumber,
}: ValidatePublicGuestListFormParams): PublicGuestListValidationResult {
  const errors: { name?: string; phoneNumber?: string } = {};

  if (!name.trim()) {
    errors.name = FrontendErrorMessages.NAME_EMPTY;
  }

  if (!phoneNumber.trim()) {
    errors.phoneNumber = FrontendErrorMessages.PHONE_NUMBER_EMPTY;
  } else if (!isValidPhoneNumber(phoneNumber.trim())) {
    errors.phoneNumber = FrontendErrorMessages.PHONE_NUMBER_FORMAT;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
