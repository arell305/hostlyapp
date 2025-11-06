"use client";

import { useState } from "react";
import EventFormActions from "@/shared/ui/buttonContainers/EventFormActions";
import { useEventForm } from "@/shared/hooks/contexts";
import {
  EventFormInput,
  GuestListFormInput,
  TicketType,
} from "@shared/types/types";
import { validateEventForm } from "@/shared/utils/form-validation/validateEventForm";
import { Id } from "convex/_generated/dataModel";

interface EventFormActionControllerProps {
  isEdit: boolean;
  isUpdateEventLoading?: boolean;
  saveError?: string | null;
  submitError?: string | null;
  onCancelEdit?: () => void;
  organizationId?: Id<"organizations">;
  onSubmit: (
    organizationId: Id<"organizations">,
    eventData: EventFormInput,
    ticketData: TicketType[],
    guesListData: GuestListFormInput | null
  ) => Promise<void>;
}

const EventFormActionController: React.FC<EventFormActionControllerProps> = ({
  isEdit,

  isUpdateEventLoading,
  saveError,
  submitError,
  onCancelEdit,
  onSubmit,
  organizationId,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    eventName,
    startTime,
    endTime,
    photoStorageId,
    address,
    isTicketsSelected,
    ticketTypes,
    isGuestListSelected,
    guestListCloseTime,
    checkInCloseTime,
    guestListRules,
    description,
    setErrors,
  } = useEventForm();
  const isSubmitDisabled =
    !eventName.trim() ||
    !startTime ||
    !endTime ||
    !photoStorageId ||
    !address ||
    !address.trim() ||
    (isTicketsSelected &&
      ticketTypes.some(
        (type) =>
          !type.name ||
          !type.price ||
          !type.capacity ||
          !type.ticketSalesEndTime
      )) ||
    (isGuestListSelected && (!guestListCloseTime || !checkInCloseTime)) ||
    isLoading;

  const handleSubmit = async () => {
    setErrors({});
    const validationErrors = validateEventForm({
      eventName,
      photoStorageId,
      startTime,
      endTime,
      address,
      isTicketsSelected,
      ticketTypes,
      isGuestListSelected,
      guestListCloseTime,
      checkInCloseTime,
      organizationId,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log("validationErrors", validationErrors);
      return;
    }

    const parsedTicketTypes: TicketType[] = ticketTypes.map((t, i) => {
      if (t.ticketSalesEndTime == null) {
        throw new Error(`ticketSalesEndTime is missing for ticket index ${i}`);
      }

      return {
        name: t.name.trim(),
        price: parseFloat(t.price),
        capacity: parseInt(t.capacity, 10),
        ticketSalesEndTime: t.ticketSalesEndTime, // already a number
      };
    });

    setIsLoading(true);
    try {
      const eventData: EventFormInput = {
        name: eventName,
        description: description.trim() !== "" ? description : null,
        startTime: startTime!,
        endTime: endTime!,
        photo: photoStorageId!,
        address: address?.trim() ?? "",
      };

      const guestListData: GuestListFormInput | null = isGuestListSelected
        ? {
            guestListCloseTime: guestListCloseTime || 0,
            checkInCloseTime: checkInCloseTime || 0,
            guestListRules: guestListRules,
          }
        : null;

      await onSubmit(
        organizationId!,
        eventData,
        parsedTicketTypes,
        guestListData
      );
    } catch (error) {
      console.error("Error submitting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <EventFormActions
        isEdit={isEdit}
        isLoading={isLoading}
        isUpdateLoading={isUpdateEventLoading}
        saveError={submitError || saveError}
        onCancel={onCancelEdit || (() => {})}
        isSubmitDisabled={isSubmitDisabled}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default EventFormActionController;
