import {
  GuestListEntryWithPromoter,
  TicketSchemaWithPromoter,
} from "@/shared/types/schemas-types";
import { GuestEntry, GuestListNameSchema } from "@/shared/types/types";
import _ from "lodash";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { isValidPhoneNumber } from "./frontend-validation";
import parsePhoneNumberFromString, {
  parsePhoneNumber,
} from "libphonenumber-js";

export function formatName(name: string): string {
  return name
    .split(" ")
    .map((word) => _.capitalize(word.toLowerCase()))
    .join(" ");
}

export function getTotalMales(guests: GuestListNameSchema[]): number {
  return guests.reduce((sum, guest) => sum + (guest.malesInGroup || 0), 0);
}

export function getTotalFemales(guests: GuestListNameSchema[]): number {
  return guests.reduce((sum, guest) => sum + (guest.femalesInGroup || 0), 0);
}

export function getSortedFilteredGuests(
  guests: GuestListEntryWithPromoter[],
  showCheckedIn: boolean
): GuestListEntryWithPromoter[] {
  return guests
    .filter((guest) => (showCheckedIn ? guest.attended : !guest.attended))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function filterGuestsByName(
  guests: GuestListEntryWithPromoter[],
  searchTerm: string
): GuestListEntryWithPromoter[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();

  if (!normalizedTerm) return guests;

  return guests.filter((guest) =>
    guest.name.toLowerCase().includes(normalizedTerm)
  );
}

export function filterContactsByName(
  contacts: Doc<"contacts">[],
  searchTerm: string
): Doc<"contacts">[] {
  const term = searchTerm.trim().toLowerCase();

  if (!term) {
    return contacts;
  }

  const isNumberSearch = /^\d+$/.test(term);
  const cleanTerm = term.replace(/[^\d]/g, "");

  return contacts.filter((contact) => {
    const name = (contact.name ?? "").toLowerCase();
    const phone = (contact.phoneNumber ?? "").toString();
    const cleanPhone = phone.replace(/[^\d]/g, "");

    if (isNumberSearch) {
      return phone.includes(term) || cleanPhone.includes(cleanTerm);
    }

    return name.includes(term);
  });
}

export function filterTemplatesByNameOrBody(
  templates: Doc<"smsTemplates">[],
  searchTerm: string
): Doc<"smsTemplates">[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();
  if (!normalizedTerm) {
    return templates;
  }

  return templates.filter(
    (template) =>
      template.name.toLowerCase().includes(normalizedTerm) ||
      template.body.toLowerCase().includes(normalizedTerm)
  );
}

export function filterCampaignsByName(
  campaigns: Doc<"campaigns">[],
  searchTerm: string
): Doc<"campaigns">[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();
  if (!normalizedTerm) return campaigns;
  return campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(normalizedTerm)
  );
}

export function filterBySearchTerm<T>(
  list: T[],
  searchTerm: string,
  selector: (item: T) => string
): T[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();
  if (!normalizedTerm) return list;

  return list.filter((item) =>
    selector(item).toLowerCase().includes(normalizedTerm)
  );
}

export function filterFaqs(
  faqs: Doc<"faq">[],
  searchTerm: string
): Doc<"faq">[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();
  if (!normalizedTerm) {
    return faqs;
  }

  return faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(normalizedTerm) ||
      faq.answer.toLowerCase().includes(normalizedTerm)
  );
}

export function filterUsers(
  users: Doc<"users">[],
  searchTerm: string
): Doc<"users">[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();
  if (!normalizedTerm) {
    return users;
  }

  return users.filter((user) =>
    user.name?.toLowerCase().includes(normalizedTerm)
  );
}

export function filterTicketsByPromoter(
  tickets: TicketSchemaWithPromoter[],
  promoterId: Id<"users"> | "all"
): TicketSchemaWithPromoter[] {
  return tickets.filter(
    (ticket) => promoterId === "all" || ticket.promoterUserId === promoterId
  );
}

interface ParsedGuestListResult {
  guests: GuestEntry[];
  invalidPhones: string[];
}

export function parseGuestListInput(input: string): ParsedGuestListResult {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  const guests: GuestEntry[] = [];
  const invalidPhones: string[] = [];

  for (const line of lines) {
    const words = line.split(/\s+/);
    const lastWord = words[words.length - 1];
    const restAsName = words.slice(0, -1).join(" ");
    const looksLikePhone = /^\+?\d{6,}$/.test(lastWord); // 6+ digits, optional +

    let name: string;
    const entry: GuestEntry = { name: "" };

    if (words.length === 1 || !looksLikePhone) {
      name = line; // full line is name
    } else {
      name = restAsName;
      if (isValidPhoneNumber(lastWord)) {
        entry.phoneNumber = lastWord;
      } else {
        invalidPhones.push(lastWord);
      }
    }

    const cleanedName = name
      .split(" ")
      .map((word) => _.capitalize(word.toLowerCase()))
      .join(" ");

    entry.name = cleanedName;
    guests.push(entry);
  }

  return { guests, invalidPhones };
}

export const formatPhoneNumber = (phone: string): string => {
  try {
    const num = parsePhoneNumberFromString(phone, "US");
    return num?.isValid() ? num.formatNational() : phone;
  } catch {
    return phone;
  }
};
export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);
}
