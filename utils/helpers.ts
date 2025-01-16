import { pricingOptions } from "../constants/pricingOptions";
import { PricingOption } from "@/types/types";
import { OrganizationJSON } from "@clerk/backend";
import { UserRole as ImportedUserRole, UserRoleEnum } from "./enum";
import { toZonedTime, format } from "date-fns-tz";
import moment from "moment-timezone";

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
  return format(new Date(timestamp), "h:mma");
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

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDateMDY = (dateString: string): string => {
  return moment(dateString).format("MMMM D, YYYY");
};

export const formatTime = (dateString: string): string => {
  return `${moment(dateString).format("h:mm A")}`;
};

export const formatToTimeAndShortDate = (dateString: string): string => {
  return moment(dateString)
    .tz("America/Los_Angeles")
    .format("MMM D, YYYY h:mma");
};

export const checkIsHostlyAdmin = (role: string): boolean => {
  return (
    role === ImportedUserRole.Hostly_Admin ||
    role === ImportedUserRole.Hostly_Moderator
  );
};

export const containsUnderscore = (name: string): boolean => {
  return name.includes("_");
};

export const replaceSpacesWithHyphens = (name: string): string => {
  return name.replace(/\s/g, "-");
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
