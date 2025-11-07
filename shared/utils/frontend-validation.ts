import { parsePhoneNumberFromString } from "libphonenumber-js";

interface PromoDiscountResult {
  promoDiscountValue: number | null;
  promoDiscountValueError: string | null;
}

export const validatePromoDiscount = (
  input: string,
  isRequired: boolean = false
): PromoDiscountResult => {
  if (isRequired && !input.trim()) {
    return {
      promoDiscountValue: null,
      promoDiscountValueError: "Discount is required.",
    };
  }

  if (!input.trim()) {
    return { promoDiscountValue: null, promoDiscountValueError: null };
  }

  const parsedValue = parseFloat(input);

  if (isNaN(parsedValue) || !isFinite(parsedValue)) {
    return {
      promoDiscountValue: null,
      promoDiscountValueError: "Please enter a valid number.",
    };
  }

  if (parsedValue < 0) {
    return {
      promoDiscountValue: null,
      promoDiscountValueError: "Discount must be a positive number.",
    };
  }

  if (!/^\d+(\.\d{1,2})?$/.test(input)) {
    return {
      promoDiscountValue: null,
      promoDiscountValueError: "Only up to two decimal places are allowed.",
    };
  }

  return { promoDiscountValue: parsedValue, promoDiscountValueError: null };
};

export function isValidPhoneNumber(phone: string): boolean {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone.trim(), "US");
    return phoneNumber?.isValid() ?? false;
  } catch {
    return false;
  }
}

export function isValidFullName(name: string): boolean {
  return /^[A-Za-z]+([-'’]?[A-Za-z]+)?\s+[A-Za-z]+([-'’]?[A-Za-z]+)?$/.test(
    name.trim()
  );
}
