import { pricingOptions } from "../constants/pricingOptions";
import { PricingOption } from "@/types/types";
import { OrganizationJSON } from "@clerk/backend";
import { WEBSITE } from "@/types/constants";
import { DateTime } from "luxon";
import { UserSchema } from "@/types/schemas-types";
import _ from "lodash";

export const getPricingOptionById = (id: string): number | undefined => {
  const option = pricingOptions.find((option) => option.id === id);
  if (!option) return undefined;

  const amount = parseFloat(option.price.replace(/[^0-9.-]+/g, "")) * 100;
  return Math.round(amount);
};

export function getPricingOptionByName(name: string | null): PricingOption {
  const lowercasedName = name?.toLowerCase();

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

export const pstToUtc = (pstDateString: string) => {
  const pstDate = new Date(pstDateString);
  return pstDate.toISOString();
};

export const isValidEmail = (email: string) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const isIOS = (): boolean => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
};

export const getTextBeforeComma = (text: string): string => {
  const commaIndex = text.indexOf(",");

  if (commaIndex === -1) {
    return text.trim();
  }

  return text.slice(0, commaIndex).trim();
};

export const generateQRCode = async (
  ticketUniqueId: string
): Promise<string> => {
  const qrData = JSON.stringify({ ticketUniqueId });
  return qrData;
};

export const getStripeBillingCycle = (
  inputDate: DateTime,
  billingCycleAnchor: number
): { startDate: DateTime; endDate: DateTime } => {
  const anchorDate = DateTime.fromSeconds(billingCycleAnchor).toUTC();

  let startDate = anchorDate;
  if (inputDate < anchorDate) {
    while (startDate > inputDate) {
      startDate = startDate.minus({ months: 1 });
    }
  } else {
    while (startDate.plus({ months: 1 }) <= inputDate) {
      startDate = startDate.plus({ months: 1 });
    }
  }
  const endDate = startDate.plus({ months: 1 });
  startDate = startDate.plus({ days: 1 });

  return { startDate, endDate };
};

export const getBaseUrl = (): string => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return appUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return WEBSITE;
};

export const sortUsersByName = (users: UserSchema[]): UserSchema[] => {
  return [...users].sort((a, b) => {
    const [aFirst, aLast] = splitName(a.name);
    const [bFirst, bLast] = splitName(b.name);

    const lastCompare = aLast.localeCompare(bLast);
    if (lastCompare !== 0) return lastCompare;

    return aFirst.localeCompare(bFirst);
  });
};

const splitName = (fullName?: string): [string, string] => {
  if (!fullName) return ["", ""];

  const parts = fullName.trim().split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";

  return [firstName, lastName];
};

export function capitalizeWords(input: string): string {
  return _.startCase(_.toLower(input));
}
