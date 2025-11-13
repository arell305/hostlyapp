import { formatName } from "../format";
import { FrontendErrorMessages } from "@/types/enums";
import { isValidPhoneNumber } from "../frontend-validation";
import { TicketTypeForm } from "@/types/types";

export type TicketFieldError = {
  name?: string;
  price?: string;
  capacity?: string;
  ticketSalesEndTime?: string;
  description?: string;
};

export type EventFormErrors = {
  eventName?: string;
  startTime?: string;
  endTime?: string;
  address?: string;
  photo?: string;
  guestListCloseTime?: string;
  checkInCloseTime?: string;
  organizationId?: string;
  ticketFieldErrors?: TicketFieldError[];
};

interface ValidateEventFormParams {
  eventName: string;
  photoStorageId: string | null;
  startTime: number | null;
  endTime: number | null;
  address: string;
  isTicketsSelected: boolean;
  ticketTypes: TicketTypeForm[];
  isGuestListSelected: boolean;
  guestListCloseTime: number | null;
  checkInCloseTime: number | null;
  organizationId?: string;
}

export function validateEventForm(
  params: ValidateEventFormParams
): EventFormErrors {
  const errors: EventFormErrors = {};
  const ticketFieldErrors: TicketFieldError[] = [];

  if (!params.eventName.trim()) {
    errors.eventName = "Name must be filled.";
  }

  if (!params.photoStorageId) {
    errors.photo = "Event photo is required.";
  }

  if (!params.startTime || isNaN(params.startTime)) {
    errors.startTime = "Start time must be selected.";
  }

  if (!params.endTime || isNaN(params.endTime)) {
    errors.endTime = "End time must be selected.";
  } else if (params.startTime && params.endTime <= params.startTime) {
    errors.endTime = "End time must be after the start time.";
  }

  if (!params.address?.trim()) {
    errors.address = "Address must be filled.";
  }

  if (params.isTicketsSelected) {
    params.ticketTypes.forEach((type) => {
      const ticketError: TicketFieldError = {};
      if (!type.name.trim()) {
        ticketError.name = "Ticket name is required.";
      }
      if (!type.price || Number(type.price) < 0) {
        ticketError.price = "Ticket price must be valid.";
      }
      if (!type.capacity || Number(type.capacity) < 0) {
        ticketError.capacity = "Capacity must be valid.";
      }
      if (
        !type.ticketSalesEndTime ||
        isNaN(new Date(type.ticketSalesEndTime).getTime())
      ) {
        ticketError.ticketSalesEndTime = "Sales end time must be valid.";
      }

      ticketFieldErrors.push(ticketError);
    });

    const hasTicketErrors = ticketFieldErrors.some(
      (e) => Object.keys(e).length > 0
    );

    if (hasTicketErrors) {
      errors.ticketFieldErrors = ticketFieldErrors;
    }
  }

  if (params.isGuestListSelected) {
    if (!params.guestListCloseTime || isNaN(params.guestListCloseTime)) {
      errors.guestListCloseTime = "Guest list close time must be selected.";
    }

    if (!params.checkInCloseTime || isNaN(params.checkInCloseTime)) {
      errors.checkInCloseTime = "Check-in close time must be selected.";
    }
  }

  if (!params.organizationId) {
    errors.organizationId = "Organization ID is missing.";
  }

  return errors;
}

export interface GuestEditInput {
  name: string;
  phoneNumber: string;
  initialName: string | null;
}

export interface GuestEditValidationResult {
  errors: { name?: string; phone?: string };
  formattedName: string;
  isValid: boolean;
  noChanges: boolean;
}

export function validateGuestEditInput({
  name,
  phoneNumber,
  initialName,
}: GuestEditInput): GuestEditValidationResult {
  const trimmedName = name.trim();
  const trimmedPhone = phoneNumber.trim();
  const formattedName = formatName(trimmedName);

  const errors: { name?: string; phone?: string } = {};

  if (!initialName) {
    errors.name = FrontendErrorMessages.NO_GUEST_SELECTED;
  }

  if (trimmedName === "") {
    errors.name = FrontendErrorMessages.NAME_EMPTY;
  }

  if (trimmedPhone !== "" && !isValidPhoneNumber(trimmedPhone)) {
    errors.phone = FrontendErrorMessages.PHONE_NUMBER_FORMAT;
  }

  const isNameUnchanged = formattedName === initialName;
  const isPhoneUnchanged = trimmedPhone === ""; // treat empty as unchanged/null
  const noChanges = isNameUnchanged && isPhoneUnchanged;

  return {
    errors,
    formattedName,
    isValid: Object.keys(errors).length === 0 && !noChanges,
    noChanges,
  };
}

export type TicketFieldErrors = {
  name?: string;
  price?: string;
  capacity?: string;
  ticketSalesEndTime?: string;
};
