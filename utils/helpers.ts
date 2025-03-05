import { pricingOptions } from "../constants/pricingOptions";
import { PricingOption } from "@/types/types";
import { OrganizationJSON } from "@clerk/backend";
import { UserRole as ImportedUserRole, UserRoleEnum } from "./enum";
import { WEBSITE } from "@/types/constants";

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

export const getBillingCycle = (
  eventStartDate: Date,
  subscriptionStartDate: Date
) => {
  const diffInMonths = Math.floor(
    (eventStartDate.getTime() - subscriptionStartDate.getTime()) /
      (1000 * 60 * 60 * 24 * 30)
  );

  const cycleStartDate = new Date(subscriptionStartDate);
  cycleStartDate.setMonth(subscriptionStartDate.getMonth() + diffInMonths);

  const cycleEndDate = new Date(cycleStartDate);
  cycleEndDate.setMonth(cycleStartDate.getMonth() + 1);

  return {
    startDate: cycleStartDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
    endDate: cycleEndDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
  };
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

// async function checkEventLimit(userId: string, eventStartDate: Date, subscriptionStartDate: Date) {
//   const { startDate, endDate } = getBillingCycle(eventStartDate, subscriptionStartDate);

//   // Query to count how many events fall within the billing cycle
//   const eventCount = await db.query("events")
//     .filter("user_id", "==", userId)
//     .filter("event_start_date", ">=", startDate)
//     .filter("event_start_date", "<", endDate)
//     .count();

//   if (eventCount >= 3) {
//     throw new Error("You can only create 3 events in a billing cycle.");
//   }

//   return true;
// }

// import { db } from "convex";
// import { checkEventLimit } from "./helpers"; // Import checkEventLimit function

// async function createEvent(userId: string, eventName: string, eventStartDate: Date, eventEndDate: Date) {
//   // Fetch the user's subscription start date
//   const user = await db.query("users").filter("id", "==", userId).first();
//   if (!user) {
//     throw new Error("User not found.");
//   }

//   const { subscription_start } = user;

//   // Check if the user has exceeded the 3 events limit in the billing cycle
//   await checkEventLimit(userId, eventStartDate, subscription_start);

//   // Create the event if the limit is not exceeded
//   const event = await db.insert("events").values({
//     user_id: userId,
//     event_name: eventName,
//     event_start_date: eventStartDate,
//     event_end_date: eventEndDate,
//     created_at: new Date(),
//   });

//   return event;
// }

export const generateQRCodeBase64 = (ticketId: string) => {
  return `https://quickchart.io/qr?text=${encodeURIComponent(ticketId)}&size=200`;
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
