import { UserRole } from "../../utils/enum";

export const UserRoleEnum = {
  APP_ADMIN: "admin",
  PROMOTER: "promoter",
  PROMOTER_ADMIN: "promoter_admin",
  MODERATOR: "moderator",
};

export const ClerkRoleEnum = {
  ORG_ADMIN: "org:admin",
  ORG_MANAGER: "org:manager",
  ORG_MODERATOR: "org:moderator",
  ORG_PROMOTER: "org:promoter",
};

export const ClerkPermissionsEnum = {
  ORG_EVENTS_VIEW_ALL_GUESTLIST: "org:events:view_all_guestlists",
  ORG_EVENTS_CREATE: "org:events:create",
};

export const changeableRoles = Object.values(UserRole).filter(
  (role) =>
    role !== UserRole.Admin &&
    role !== UserRole.Hostly_Admin &&
    role !== UserRole.Hostly_Moderator
);

export enum TeamSettingsModalType {
  TeamName = "teamName",
  PromoDiscount = "promoDiscount",
}

export enum ErrorMessages {
  UNAUTHENTICATED = "User is not authenticated.",
  FORBIDDEN = "User does not have permission",
  GENERIC_ERROR = "An unexpected error occurred.",
  NOT_FOUND = "Not found.",
  ALREADY_CHECKED_IN = "Already checked in",
  NOT_BELONG = "User does not belong to the organization of the event.",
  INVALID_PROMO_CODE = "Invalid promoter code",
  EVENT_NOT_FOUND = "Event not found",
  TICKET_INFO_NOT_FOUND = "Ticket info not found",
  TICKET_SALES_ENDED = "Ticekt sales have ended",
  CUSTOMER_NOT_FOUND = "Customer not found",
  COMPANY_NOT_FOUND = "Company not found",
}

export enum Gender {
  Male = "male",
  Female = "female",
}
