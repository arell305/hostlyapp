import { pricingOptions } from "../constants/pricingOptions";
import { PricingOption } from "@/types";
import { OrganizationJSON } from "@clerk/backend";
import { UserRoleEnum } from "./enum";

export const getPricingOptionById = (id: string): number | undefined => {
  const option = pricingOptions.find((option) => option.id === id);
  if (!option) return undefined;

  // Convert price string to integer cents (e.g., "$99.99" to 9999)
  const amount = parseFloat(option.price.replace(/[^0-9.-]+/g, "")) * 100;
  return Math.round(amount); // Ensure it's an integer
};

export function getPricingOptionByName(name: string | null): PricingOption {
  const lowercasedName = name?.toLowerCase();
  // return plus tier if no match
  return (
    pricingOptions.find(
      (option) => option.tier.toLowerCase() === lowercasedName
    ) || pricingOptions[0]
  );
}

export const truncatedToTwoDecimalPlaces = (num: number) => {
  const [integerPart, decimalPart] = num.toString().split(".");
  if (decimalPart) {
    return `${integerPart}.${decimalPart.substring(0, 2)}`;
  }
  return integerPart;
};

export const calculateDiscountedAmount = (
  price: string,
  discount: number
): number => {
  const priceNumber = parseFloat(price);

  let discountedPrice = priceNumber * (1 - discount / 100);
  discountedPrice = Math.floor(discountedPrice * 100) / 100;
  const amount = Math.round(discountedPrice * 100);

  return amount;
};

export const getFutureISOString = (days: number): string => {
  const today = new Date();
  today.setDate(today.getDate() + days);
  return today.toISOString();
};

export function isOrganizationJSON(data: any): data is OrganizationJSON {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.id === "string" &&
    typeof data.name === "string" &&
    typeof data.slug === "string" &&
    typeof data.created_by === "string" &&
    typeof data.image_url === "string"
  );
}

type UserRole = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];

export const canCreateEvents = (role: UserRole | null): boolean => {
  const allowedRoles: UserRole[] = [
    UserRoleEnum.APP_ADMIN,
    UserRoleEnum.PROMOTER_ADMIN,
    UserRoleEnum.PROMOTER_MANAGER,
  ];

  return role !== null && allowedRoles.includes(role);
};
