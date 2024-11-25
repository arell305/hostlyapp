import { pricingOptions } from "../constants/pricingOptions";
import { PricingOption } from "@/types";
import { OrganizationJSON } from "@clerk/backend";
import { SubscriptionTier, UserRoleEnum } from "./enum";
import { parseISO } from "date-fns";
import { toZonedTime, format } from "date-fns-tz";
import moment from "moment-timezone";
import { differenceInDays } from "date-fns";

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

export const formatArrivalTime = (timestamp: string) => {
  return format(new Date(timestamp), "h:mm a");
};

export const formatDateTime = (dateTimeString: string): string => {
  const pstDate = moment(dateTimeString).tz("America/Los_Angeles");

  // Format the date and time
  return pstDate.format("MMMM D, YYYY [at] h:mm A z");
};

export const utcToPstString = (utcDate: string | null) => {
  if (!utcDate) return "";
  return format(
    toZonedTime(new Date(utcDate), "America/Los_Angeles"),
    "yyyy-MM-dd'T'HH:mm",
    { timeZone: "America/Los_Angeles" }
  );
};

export const pstToUtc = (pstDateString: string) => {
  const pstDate = new Date(pstDateString);
  return pstDate.toISOString();
};

export const localToPst = (localDate: string) => {
  // The user selects a local time, like "2024-10-25T10:00", in their local time zone.

  // Now, treat that time as if it were in PST, regardless of the user's timezone.
  const zonedPstDate = toZonedTime(localDate, "America/Los_Angeles");

  // Format the PST time to a UTC string for storage
  return zonedPstDate;
};

export const isValidEmail = (email: string) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};
