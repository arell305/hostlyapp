import {
  DollarSign,
  Ticket,
  Percent,
  BadgeCheck,
  UserCheck,
  Users,
} from "lucide-react";

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
export const APPLICATION_FEE = 299;

export const TICKET_SALES_COPY = "(price inclusive of all taxes & fees)";

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
