import { FrontendErrorMessages } from "@/shared/types/enums";
import { validatePromoDiscount } from "../frontend-validation";
interface ValidateCompanyFormInput {
  companyName: string;
  promoDiscountAmount: string;
}

type ErrorState = {
  companyName: string | null;
  promoDiscount: string | null;
};

export const validateCompanyForm = ({
  companyName,
  promoDiscountAmount,
}: ValidateCompanyFormInput): {
  errors: ErrorState;
  isValid: boolean;
  promoDiscountValue: number | null;
} => {
  const errors: ErrorState = {
    companyName: null,
    promoDiscount: null,
  };

  let promoDiscountValue: number | null = null;
  let isValid = true;

  if (companyName.trim() === "") {
    errors.companyName = FrontendErrorMessages.COMPANY_NAME_REQUIRED;
    isValid = false;
  }

  const { promoDiscountValue: value, promoDiscountValueError } =
    validatePromoDiscount(promoDiscountAmount);

  if (promoDiscountValueError) {
    errors.promoDiscount = promoDiscountValueError;
    isValid = false;
  } else {
    promoDiscountValue = value;
  }

  return {
    errors,
    isValid,
    promoDiscountValue,
  };
};
