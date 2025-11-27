import {
  DollarSign,
  Ticket,
  Percent,
  BadgeCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { PricingOption } from "./types";

export const TITLE = "Hostly";
export const DESC =
  "Streamline your event planning with our all-in-one management app for guest lists, ticket sales, and event promotion.";
export const META_DESC =
  "Discover the ultimate event management solution with our app. Save time, automate processes, and attract larger audiences effortlessly. Ideal for promotional companies seeking efficiency and scalability in event planning.";
export const PHONE = "+1 (702) 613-8800";
export const PHONE_HREF = "tel:+17026138800";
export const WEBSITE = "https://www.hostlyapp.com";
export const PLUS_GUEST_LIST_LIMIT = 5;
export const TIME_ZONE = "America/Los_Angeles";
export const STRIPE_API_VERSION = "2024-06-20";
export const USD_CURRENCY = "usd";
export const DESKTOP_WIDTH = "(min-width: 768px)";

export const UPDATED_DATE = "March 13, 2025";
export const EFFECTIVE_DATE = "March 13, 2025";
export const CONTACT_EMAIL = "support@hostlyapp.com";
export const CONTACT_PHONE = "702-613-8800";
export const COMPANY_NAME = "Hostly";

const SmsMessageType = {
  ALL_DB_GUESTS: "all_guests",
  ATTENDED_EVENT: "attended_event",
  BEFORE_EVENT: "before_event",
  NOT_ATTENDED_EVENT: "not_attended_event",
} as const;

export const pricingOptions: PricingOption[] = [
  {
    id: "prod_QpJqLkwhLCLZfN",
    tier: "Standard" as const,
    price: "39.99",
    description: "Unlimited Tickets",
    isFree: true,
    priceId: "price_1PxexNRv8MX5Pza1YpAG3Znt",
  },
  {
    id: "prod_QpJo0GlbKBCugX",
    tier: "Plus" as const,
    price: "99.99",
    description: `Unlimited Tickets & ${PLUS_GUEST_LIST_LIMIT} Guest List Events`,
    isFree: true,
    priceId: "price_1PxfAnRv8MX5Pza1kFwM4gmI",
  },
  {
    id: "prod_SqWluQ6a2eiIhq",
    tier: "Elite" as const,
    price: "299.99",
    description: "Unlimited Tickets & Guest List",
    isFree: false,
    priceId: "price_1Rupi4Rv8MX5Pza1FVIlr1Id",
  },
];

// datePresets.ts
export const PRESET_OPTIONS = [
  "Last 7 Days",
  "Last 30 Days",
  "This Month",
  "Last Month",
  "Custom",
] as const;

export type PresetOption = (typeof PRESET_OPTIONS)[number];

export const ticketKpis = [
  { label: "Total Revenue", key: "totalRevenue", icon: DollarSign },
  { label: "Revenue / Day", key: "avgDailyRevenue", icon: DollarSign },
  { label: "Tickets Sold", key: "ticketsSold", icon: Ticket },
  { label: "Tickets / Day", key: "avgDailyTicketsSold", icon: Ticket },
];

export const guestListKpis = [
  {
    label: "RSVP / Event",
    key: "avgRsvpPerEvent",
    icon: Users,
  },
  {
    label: "Check-ins / Event",
    key: "avgCheckinsPerEvent",
    icon: UserCheck,
  },
  {
    label: "Check-in Rate",
    key: "avgCheckinRate",
    icon: Percent,
  },
  {
    label: "Check-ins / Promoter",
    key: "avgCheckinsPerPromoter",
    icon: BadgeCheck,
  },
];

export const GUEST_LIST_CREDIT_PRICE: {
  amountInCents: number;
  creditsPerUnit: number;
} = {
  amountInCents: 2000, // $20.00 per credit
  creditsPerUnit: 1,
};

export const priceRegex = /^\d*\.?\d{0,2}$/;

export const ticketNameOptions = [
  "GA - Male",
  "GA - Female",
  "VIP - Male",
  "VIP - Female",
];
export const ERROR_TITLES: Record<string, string> = {
  UNAUTHORIZED: "Please sign in",
  FORBIDDEN: "You don\u2019t have access",
  NOT_FOUND: "Not found",
  INTERNAL_ERROR: "Something went wrong",
};

export const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Your session may have expired.",
  FORBIDDEN: "You don't have permission to view this.",
  NOT_FOUND: "We couldn't find what you're looking for.",
  VALIDATION_FAILED: "Please review the form and try again.",
  CONFLICT: "That action conflicts with the current state.",
  RATE_LIMITED: "You're doing that too quickly. Please try again shortly.",
  INTERNAL_ERROR: "Something went wrong. Please try again.",
};

export const DEFAULT_ERROR_MESSAGE =
  "An unexpected error occurred. Please try again.";

export const SEARCH_MIN_LENGTH = 6;
