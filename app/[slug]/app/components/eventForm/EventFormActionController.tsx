"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import NProgress from "nprogress";
import EventFormActions from "@/components/shared/buttonContainers/EventFormActions";
import ResponsiveConfirm from "../responsive/ResponsiveConfirm";
import { useCancelEvent } from "../../events/hooks/useCancelEvent";
import { EventSchema } from "@/types/schemas-types";
import { useEventForm } from "@/contexts/EventFormContext";
import { EventFormInput, GuestListFormInput, TicketType } from "@/types/types";
import { validateEventForm } from "@/utils/form-validation/validateEventForm";
import { Id } from "convex/_generated/dataModel";

interface EventFormActionControllerProps {
  isEdit: boolean;
  initialEventData?: EventSchema;
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
  initialEventData,
  isUpdateEventLoading,
  saveError,
  submitError,
  onCancelEdit,
  onSubmit,
  organizationId,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
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

  const {
    cancelEvent,
    isLoading: isDeleteLoading,
    error: deleteError,
    setError: setDeleteError,
  } = useCancelEvent();

  const onDeleteEvent = async () => {
    if (initialEventData) {
      const success = await cancelEvent(initialEventData._id);
      if (success) {
        const slug = pathname.split("/")[1];
        NProgress.start();
        router.push(`/${slug}/app`);
      }
    }
  };

  const handleDeleteEvent = () => {
    setShowConfirmModal(true);
  };

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
        isDeleteLoading={isDeleteLoading}
        saveError={submitError || saveError}
        deleteError={deleteError}
        onCancel={onCancelEdit || (() => {})}
        onDelete={handleDeleteEvent}
        isSubmitDisabled={isSubmitDisabled}
        onSubmit={handleSubmit}
      />

      <ResponsiveConfirm
        isOpen={showConfirmModal}
        title="Confirm Event Deletion"
        content="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete Event"
        cancelText="Keep Event"
        confirmVariant="destructive"
        error={deleteError}
        isLoading={isDeleteLoading}
        modalProps={{
          onClose: () => setShowConfirmModal(false),
          onConfirm: async () => {
            await onDeleteEvent();
          },
        }}
        drawerProps={{
          onOpenChange: (open) => {
            if (!open) setDeleteError(null);
            setShowConfirmModal(open);
          },
          onSubmit: async () => {
            await onDeleteEvent();
          },
        }}
      />
    </>
  );
};

export default EventFormActionController;
