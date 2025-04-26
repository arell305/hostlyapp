import { DateTime } from "luxon";

interface ValidateEventFormParams {
  eventName: string;
  photoStorageId: string | null;
  startTime: number | null;
  endTime: number | null;
  address: string;
  isTicketsSelected: boolean;
  maleTicketPrice: string;
  femaleTicketPrice: string;
  maleTicketCapacity: string;
  femaleTicketCapacity: string;
  ticketSalesEndTime: number | null;
  isGuestListSelected: boolean;
  guestListCloseTime: number | null;
  checkInCloseTime: number | null;
  organizationId?: string | null;
}

type ValidationErrors = Record<string, string>;

export function validateEventForm({
  eventName,
  photoStorageId,
  startTime,
  endTime,
  address,
  isTicketsSelected,
  maleTicketPrice,
  femaleTicketPrice,
  maleTicketCapacity,
  femaleTicketCapacity,
  ticketSalesEndTime,
  isGuestListSelected,
  guestListCloseTime,
  checkInCloseTime,
  organizationId,
}: ValidateEventFormParams): ValidationErrors {
  const errors: ValidationErrors = {};
  const now = DateTime.now().toMillis();

  if (!eventName.trim()) {
    errors.eventName = "Name must be filled.";
  }

  if (!photoStorageId) {
    errors.photo = "Event photo is required.";
  }

  if (!startTime || isNaN(startTime)) {
    errors.startTime = "Start time must be selected.";
  } else if (startTime < now) {
    errors.startTime = "Start time must be in the future.";
  }

  if (!endTime || isNaN(endTime)) {
    errors.endTime = "End time must be selected.";
  } else if (startTime && endTime <= startTime) {
    errors.endTime = "End time must be after the start time.";
  }

  if (!address.trim()) {
    errors.address = "Address must be filled.";
  }

  if (isTicketsSelected) {
    if (!maleTicketPrice.trim() || parseFloat(maleTicketPrice) < 0) {
      errors.maleTicketPrice = "Male ticket price must be valid.";
    }
    if (!femaleTicketPrice.trim() || parseFloat(femaleTicketPrice) < 0) {
      errors.femaleTicketPrice = "Female ticket price must be valid.";
    }
    if (!maleTicketCapacity.trim() || parseInt(maleTicketCapacity) < 0) {
      errors.maleTicketCapacity = "Male ticket capacity must be valid.";
    }
    if (!femaleTicketCapacity.trim() || parseInt(femaleTicketCapacity) < 0) {
      errors.femaleTicketCapacity = "Female ticket capacity must be valid.";
    }
    if (!ticketSalesEndTime || isNaN(ticketSalesEndTime)) {
      errors.ticketSalesEndTime = "Ticket sales end time must be selected.";
    }
  }

  if (isGuestListSelected) {
    if (!guestListCloseTime || isNaN(guestListCloseTime)) {
      errors.guestListCloseTime = "Guest list close time must be selected.";
    }
    if (!checkInCloseTime || isNaN(checkInCloseTime)) {
      errors.checkInCloseTime = "Check-in close time must be selected.";
    }
  }

  if (!organizationId) {
    errors.general = "Organization ID is missing.";
  }

  return errors;
}
