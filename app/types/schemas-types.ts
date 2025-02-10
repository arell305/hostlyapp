import { Id } from "../../convex/_generated/dataModel";
import { UserRole } from "../../utils/enum";
import { Gender } from "./enums";

export interface UserSchema {
  _id: Id<"users">;
  clerkUserId?: string;
  email: string;
  clerkOrganizationId?: string;
  acceptedInvite: boolean;
  customerId?: Id<"customers">;
  role: UserRole | null;
  name?: string;
  imageUrl?: string;
}

interface OrganizationsSchema {
  _id: Id<"organizations">;
  _creationTime: number;
  clerkOrganizationId: string;
  name: string;
  clerkUserIds: string[];
  imageUrl?: string;
  eventIds: Id<"events">[];
  customerId: Id<"customers">;
  promoDiscount: number;
  isActive?: boolean;
}

export interface TicketSchema {
  _id: Id<"tickets">;
  eventId: Id<"events">;
  clerkPromoterId: string | null;
  email: string;
  gender: Gender;
  checkInTime?: number;
  ticketUniqueId: string;
  _creationTime: number;
}

export interface CustomerTicket extends TicketSchema {
  name: string;
  startTime: number;
  endTime: number;
  address: string;
}

export interface TicketSchemaWithPromoter extends TicketSchema {
  promoterName: string | null;
}

export interface PromoterPromoCodeSchema {
  _id: Id<"promoterPromoCode">;
  _creationTime: number;
  name: string;
  clerkPromoterUserId: string;
}

export interface PromoterPromoCodeWithDiscount extends PromoterPromoCodeSchema {
  promoDiscount: number;
}

export interface EventSchema {
  _id: Id<"events">;
  clerkOrganizationId: string;
  name: string;
  description: string | null;
  startTime: number;
  endTime: number;
  photo: Id<"_storage"> | null;
  address: string;
  isActive: boolean;
  ticketInfoId?: Id<"ticketInfo"> | null;
  guestListInfoId?: Id<"guestListInfo"> | null;
}

export interface TicketInfoSchema {
  _id: Id<"ticketInfo">;
  _creationTime: number;
  eventId: Id<"events">;
  maleTicketPrice: number;
  femaleTicketPrice: number;
  maleTicketCapacity: number;
  femaleTicketCapacity: number;
  ticketSalesEndTime: number;
}

export interface GuestListInfoSchema {
  _id: Id<"guestListInfo">;
  _creationTime: number;
  eventId: Id<"events">;
  guestListCloseTime: number;
  checkInCloseTime: number;
}
