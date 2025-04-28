import { Gender } from "@/types/enums";
import { TicketSchema, TicketSchemaWithPromoter } from "@/types/schemas-types";
import {
  GuestEntry,
  GuestListNameSchema,
  GuestWithPromoter,
} from "@/types/types";
import _ from "lodash";
import { Id } from "../convex/_generated/dataModel";
import { isValidPhoneNumber } from "./frontend-validation";

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
  guests: GuestWithPromoter[],
  showCheckedIn: boolean
): GuestWithPromoter[] {
  return guests
    .filter((guest) => (showCheckedIn ? guest.attended : !guest.attended))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function filterGuestsByName(
  guests: GuestListNameSchema[],
  searchTerm: string
): GuestListNameSchema[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();

  if (!normalizedTerm) return guests;

  return guests.filter((guest) =>
    guest.name.toLowerCase().includes(normalizedTerm)
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

export function countTicketsByGender(
  tickets: TicketSchema[] | TicketSchemaWithPromoter[]
): {
  maleTickets: number;
  femaleTickets: number;
} {
  return tickets.reduce(
    (acc, ticket) => {
      if (ticket.gender === Gender.Male) acc.maleTickets++;
      else if (ticket.gender === Gender.Female) acc.femaleTickets++;
      return acc;
    },
    { maleTickets: 0, femaleTickets: 0 }
  );
}

export function countTicketsByGenderWithPromoter(
  tickets: TicketSchema[],
  selectedPromoterId: Id<"users"> | "all"
): { maleTicketsWithPromoter: number; femaleTicketsWithPromoter: number } {
  return tickets.reduce(
    (acc, ticket) => {
      const isValidPromoter = ticket.promoterUserId !== null;
      const isMatchingPromoter =
        selectedPromoterId === "all"
          ? isValidPromoter
          : ticket.promoterUserId === selectedPromoterId;

      if (isMatchingPromoter) {
        if (ticket.gender === Gender.Male) acc.maleTicketsWithPromoter++;
        else if (ticket.gender === Gender.Female)
          acc.femaleTicketsWithPromoter++;
      }

      return acc;
    },
    { maleTicketsWithPromoter: 0, femaleTicketsWithPromoter: 0 }
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
    const [namePart, phonePart] = line.split(",").map((s) => s.trim());
    const name = namePart
      .split(" ")
      .map((word) => _.capitalize(word.toLowerCase()))
      .join(" ");

    if (phonePart && !isValidPhoneNumber(phonePart)) {
      invalidPhones.push(phonePart);
    }

    guests.push({
      name,
      ...(phonePart &&
        isValidPhoneNumber(phonePart) && { phoneNumber: phonePart }),
    });
  }

  return { guests, invalidPhones };
}
