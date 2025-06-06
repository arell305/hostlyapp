import React, { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  AddressValue,
  EventFormInput,
  GuestListFormInput,
  ModalConfig,
  TicketFormInput,
} from "@/types/types";
import ResponsiveConfirm from "./responsive/ResponsiveConfirm";
import {
  convertToPstTimestamp,
  timestampToPstString,
} from "../../../../utils/luxon";
import {
  EventSchema,
  GuestListInfoSchema,
  SubscriptionSchema,
  TicketInfoSchema,
} from "@/types/schemas-types";
import { SubscriptionTier } from "@/types/enums";
import { compressAndUploadImage } from "../../../../utils/image";
import { PLUS_GUEST_LIST_LIMIT, priceRegex } from "@/types/constants";
import { useCancelEvent } from "../events/hooks/useCancelEvent";
import LabeledInputField from "@/components/shared/fields/LabeledInputField";
import LabeledTextAreaField from "@/components/shared/fields/LabeledTextAreaField";
import LabeledAddressAutoComplete from "@/components/shared/fields/LabeledAddressAutoComplete";
import LabeledDateTimeField from "@/components/shared/fields/LabeledDateTimeField";
import LabeledImageUploadField from "@/components/shared/fields/LabeledImageUploadField";
import EventFormActions from "@/components/shared/buttonContainers/EventFormActions";
import ToggleSectionCard from "@/components/shared/toggle/ToggleSectionCard";
import { validateEventForm } from "../../../../utils/form-validation/validateEventForm";
import { Button } from "@/components/ui/button";
import { isIOS } from "@/utils/helpers";
import { usePathname, useRouter } from "next/navigation";
import NProgress from "nprogress";

interface EventFormProps {
  initialEventData?: EventSchema;
  initialTicketData?: TicketInfoSchema | null;
  initialGuestListData?: GuestListInfoSchema | null;
  onSubmit: (
    organizationId: Id<"organizations">,
    eventData: EventFormInput,
    ticketData: TicketFormInput | null,
    guesListData: GuestListFormInput | null
  ) => Promise<void>;
  isEdit: boolean;
  onCancelEdit?: () => void;
  saveEventError?: string | null;
  isStripeEnabled: boolean;
  isUpdateEventLoading?: boolean;
  subscription: SubscriptionSchema;
  organizationId?: Id<"organizations">;
  isSubmitLoading?: boolean;
  submitError?: string | null;
  handleBuyCredit: () => void;
  isCompanyAdmin: boolean;
  availableCredits?: number;
}

const EventForm: React.FC<EventFormProps> = ({
  initialEventData,
  initialTicketData,
  initialGuestListData,
  onSubmit,
  isEdit,
  onCancelEdit,
  saveEventError,
  isStripeEnabled,
  isUpdateEventLoading,
  subscription,
  organizationId,
  isSubmitLoading,
  submitError,
  handleBuyCredit,
  isCompanyAdmin,
  availableCredits = 0,
}) => {
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  // Text fields
  const [eventName, setEventName] = useState(initialEventData?.name || "");
  const [description, setDescription] = useState(
    initialEventData?.description || ""
  );
  const [address, setAddress] = useState(initialEventData?.address);

  // Date/times
  const [startTime, setStartTime] = useState<number | null>(
    initialEventData?.startTime || null
  );
  const [endTime, setEndTime] = useState<number | null>(
    initialEventData?.endTime || null
  );
  const [guestListCloseTime, setGuestListCloseTime] = useState<number | null>(
    initialGuestListData?.guestListCloseTime || null
  );
  const [checkInCloseTime, setCheckInCloseTime] = useState<number | null>(
    initialGuestListData?.checkInCloseTime || null
  );
  const [ticketSalesEndTime, setTicketSalesEndTime] = useState<number | null>(
    initialTicketData?.ticketSalesEndTime || null
  );

  // Ticket values
  const [maleTicketPrice, setMaleTicketPrice] = useState(
    initialTicketData?.ticketTypes.male.price.toString() || ""
  );
  const [femaleTicketPrice, setFemaleTicketPrice] = useState(
    initialTicketData?.ticketTypes.female.price.toString() || ""
  );
  const [maleTicketCapacity, setMaleTicketCapacity] = useState(
    initialTicketData?.ticketTypes.male.capacity.toString() || ""
  );
  const [femaleTicketCapacity, setFemaleTicketCapacity] = useState(
    initialTicketData?.ticketTypes.female.capacity.toString() || ""
  );

  // Toggles
  const [isGuestListSelected, setIsGuestListSelected] =
    useState(!!initialGuestListData);
  const [isTicketsSelected, setIsTicketsSelected] =
    useState(!!initialTicketData);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // File/Image
  const [photoStorageId, setPhotoStorageId] = useState<Id<"_storage"> | null>(
    initialEventData?.photo || null
  );
  const [isPhotoLoading, setIsPhotoLoading] = useState<boolean>(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  // Errors
  const [errors, setErrors] = useState<{
    eventName?: string;
    maleTicketPrice?: string;
    femaleTicketPrice?: string;
    maleTicketCapacity?: string;
    femaleTicketCapacity?: string;
    startTime?: string;
    endTime?: string;
    ticketSalesEndTime?: string;
    guestListCloseTime?: string;
    checkInCloseTime?: string;
    address?: string;
    photo?: string;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Google Autocomplete
  const [value, setValue] = useState<AddressValue | null>(null);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {},
    error: null,
    isLoading: false,
    onClose: () => {},
  });
  // GOOGLE
  const handleSelect = (value: AddressValue | null) => {
    setValue(value);
    if (value) {
      setAddress(value.label);
    }
  };
  const clearInput = () => {
    setValue(null);
    setAddress("");
  };

  const generateUploadUrl = useMutation(api.photo.generateUploadUrl);

  const displayEventPhoto = useQuery(api.photo.getFileUrl, {
    storageId: photoStorageId,
  });

  const {
    cancelEvent,
    isLoading: isDeleteLoading,
    error: deleteError,
    setError: setDeleteError,
  } = useCancelEvent();

  const guestListLimitReached =
    (subscription.subscriptionTier === SubscriptionTier.PLUS &&
      subscription.guestListEventsCount === PLUS_GUEST_LIST_LIMIT &&
      availableCredits <= 0) ||
    (subscription.subscriptionTier === SubscriptionTier.STANDARD &&
      availableCredits <= 0);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) {
      console.error("No file selected");
      return;
    }
    setPhotoUploadError(null);
    setIsPhotoLoading(true);

    try {
      const response = await compressAndUploadImage(file, generateUploadUrl);
      if (response.ok) {
        const { storageId } = await response.json();
        setPhotoStorageId(storageId as Id<"_storage">);
      } else {
        setPhotoUploadError("Photo upload failed");
        console.error("Photo upload failed");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoStorageId(null);
  };

  const handleRemoveTickets = () => {
    if (isEdit && initialTicketData) {
      setModalConfig({
        title: "Confirm Ticket Removal",
        message:
          "Are you sure you want to remove tickets? This action cannot be undone.",
        confirmText: "Remove Tickets",
        cancelText: "Cancel",
        onConfirm: () => {
          setIsTicketsSelected(false);
          setShowConfirmModal(false);
        },
        error: null,
        isLoading: false,
        onClose: () => {
          setShowConfirmModal(false);
        },
      });
      setShowConfirmModal(true);
    } else {
      setIsTicketsSelected(false);
    }
  };

  const handleRemoveGuestList = () => {
    if (isEdit && initialGuestListData) {
      setModalConfig({
        title: "Confirm Guest List Removal",
        message:
          "Are you sure you want to remove the guest list? This action cannot be undone.",
        confirmText: "Remove Guest List",
        cancelText: "Cancel",
        onConfirm: () => {
          setIsGuestListSelected(false);
          setShowConfirmModal(false);
        },
        error: null,
        isLoading: false,
        onClose: () => {
          setShowConfirmModal(false);
        },
      });
      setShowConfirmModal(true);
    } else {
      setIsGuestListSelected(false);
    }
  };

  const onDeleteEvent = async () => {
    if (initialEventData) {
      const success = await cancelEvent(initialEventData._id);
      if (success) {
        setIsDeleted(true); // Hide UI immediately
        const slug = pathname.split("/")[1];
        NProgress.start();
        router.push(`/${slug}/app`);
      }
    }
  };

  const handleDeleteEvent = () => {
    setModalConfig({
      title: "Confirm Event Deletion",
      message:
        "Are you sure you want to delete this event? This action cannot be undone.",
      confirmText: "Delete Event",
      cancelText: "Keep Event",
      onConfirm: async () => {
        await onDeleteEvent();
      },
      error: deleteError,
      isLoading: isDeleteLoading,
      onClose: () => {
        setShowConfirmModal(false);
        setDeleteError(null);
      },
    });
    setShowConfirmModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateEventForm({
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
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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

      const ticketData: TicketFormInput | null = isTicketsSelected
        ? {
            maleTicketPrice: parseFloat(maleTicketPrice) || 0,
            femaleTicketPrice: parseFloat(femaleTicketPrice) || 0,
            maleTicketCapacity: parseInt(maleTicketCapacity) || 0,
            femaleTicketCapacity: parseInt(femaleTicketCapacity) || 0,
            ticketSalesEndTime: ticketSalesEndTime || 0,
          }
        : null;

      const guestListData: GuestListFormInput | null = isGuestListSelected
        ? {
            guestListCloseTime: guestListCloseTime || 0,
            checkInCloseTime: checkInCloseTime || 0,
          }
        : null;

      await onSubmit(organizationId!, eventData, ticketData, guestListData);
    } catch (error) {
      console.error("Error submitting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setState: React.Dispatch<React.SetStateAction<number | null>>
  ) => {
    const dateTimeString = e.target.value;
    const timestamp = convertToPstTimestamp(dateTimeString);
    setState(timestamp);
  };

  const isIOSDevice = isIOS();

  const isSubmitDisabled =
    !eventName.trim() ||
    !startTime ||
    !endTime ||
    !photoStorageId ||
    !address ||
    !address.trim() ||
    (isTicketsSelected &&
      (!maleTicketPrice ||
        !femaleTicketPrice ||
        !maleTicketCapacity ||
        !femaleTicketCapacity ||
        !ticketSalesEndTime)) ||
    (isGuestListSelected && (!guestListCloseTime || !checkInCloseTime)) ||
    isLoading || // optional: prevent double submit
    isSubmitLoading;

  const creditLabel = availableCredits === 1 ? "credit" : "credits";

  const guestListSubtitle =
    subscription.subscriptionTier === SubscriptionTier.PLUS
      ? `(${subscription.guestListEventsCount}/${PLUS_GUEST_LIST_LIMIT} events this cycle | ${availableCredits} ${creditLabel} available)`
      : subscription.subscriptionTier === SubscriptionTier.STANDARD
        ? `${availableCredits} ${creditLabel} available`
        : undefined;

  if (isDeleted) return null;

  return (
    <>
      {isCalendarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsCalendarOpen(false)} // Close on clicking outside
        ></div>
      )}
      <form onSubmit={handleSubmit} className=" py-4 w-full">
        <LabeledImageUploadField
          id="photo"
          label="Event Photo*"
          imageUrl={displayEventPhoto}
          isLoading={isPhotoLoading}
          error={photoUploadError || errors.photo}
          onChange={handlePhotoChange}
          onRemove={handleRemovePhoto}
        />
        <LabeledInputField
          name="eventName"
          label="Name*"
          placeholder="Enter event name"
          value={eventName}
          onChange={(e) => {
            setEventName(e.target.value);
            setErrors((prev) => ({ ...prev, eventName: undefined }));
          }}
          error={errors.eventName}
        />

        <LabeledTextAreaField
          name="description"
          label="Description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          placeholder="Add a description for your event."
          rows={6}
          className="w-full "
        />
        <LabeledAddressAutoComplete
          label="Address*"
          address={address || ""}
          onSelect={handleSelect}
          value={value}
          error={errors.address}
          clearInput={clearInput}
        />
        <LabeledDateTimeField
          name="startTime"
          label="Starts*"
          value={timestampToPstString(startTime)}
          onChange={(e) => {
            handleDateTimeChange(e, setStartTime);
            setErrors((prev) => ({ ...prev, startTime: undefined }));
          }}
          error={errors.startTime}
          isIOS={isIOSDevice}
        />
        <LabeledDateTimeField
          name="endTime"
          label="Ends*"
          value={timestampToPstString(endTime)}
          onChange={(e) => {
            handleDateTimeChange(e, setEndTime);
            setErrors((prev) => ({ ...prev, endTime: undefined }));
          }}
          error={errors.endTime}
          isIOS={isIOSDevice}
        />

        <ToggleSectionCard
          label="GUEST LIST OPTION"
          isActive={isGuestListSelected}
          onToggle={() =>
            isGuestListSelected
              ? handleRemoveGuestList()
              : setIsGuestListSelected(true)
          }
          subtitle={guestListSubtitle}
        />

        {isGuestListSelected &&
          (guestListLimitReached ? (
            <div className="flex flex-col space-y-2 mb-4 px-4">
              <p className="text-red-500  ">Guest list limit reached.</p>

              {isCompanyAdmin && (
                <Button
                  type="button"
                  variant="nav"
                  className=""
                  onClick={handleBuyCredit}
                >
                  Buy Credit
                </Button>
              )}
            </div>
          ) : (
            <>
              <LabeledDateTimeField
                name="guestListCloseTime"
                label="Guest List Upload Close Time*"
                value={timestampToPstString(guestListCloseTime)}
                onChange={(e) => {
                  handleDateTimeChange(e, setGuestListCloseTime);
                  setErrors((prev) => ({
                    ...prev,
                    guestListCloseTime: undefined,
                  }));
                }}
                error={errors.guestListCloseTime}
                isIOS={isIOSDevice}
              />
              <LabeledDateTimeField
                name="checkInCloseTime"
                label="Check In Close Time*"
                value={timestampToPstString(checkInCloseTime)}
                onChange={(e) => {
                  handleDateTimeChange(e, setCheckInCloseTime);
                  setErrors((prev) => ({
                    ...prev,
                    checkInCloseTime: undefined,
                  }));
                }}
                error={errors.checkInCloseTime}
                isIOS={isIOSDevice}
              />
            </>
          ))}
        {isStripeEnabled ? (
          <ToggleSectionCard
            label="TICKET OPTION"
            isActive={isTicketsSelected}
            onToggle={() =>
              isTicketsSelected
                ? handleRemoveTickets()
                : setIsTicketsSelected(true)
            }
          />
        ) : (
          <p className="text-red-700 px-4">
            Please have admin integrate Stripe before selling tickets.
          </p>
        )}

        {isTicketsSelected && (
          <>
            <LabeledInputField
              name="maleTicketPrice"
              label="Male Ticket Price*"
              type="number"
              placeholder="Enter male ticket price"
              value={maleTicketPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (priceRegex.test(value) || value === "") {
                  setMaleTicketPrice(value);
                  setErrors((prev) => ({
                    ...prev,
                    maleTicketPrice: undefined,
                  }));
                }
              }}
              error={errors.maleTicketPrice}
              className="w-full"
              min="0"
            />
            <LabeledInputField
              name="femaleTicketPrice"
              label="Female Ticket Price*"
              type="number"
              placeholder="Enter female ticket price"
              value={femaleTicketPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (priceRegex.test(value) || value === "") {
                  setFemaleTicketPrice(value);
                  setErrors((prev) => ({
                    ...prev,
                    femaleTicketPrice: undefined,
                  }));
                }
              }}
              error={errors.femaleTicketPrice}
              className="w-full "
              min="0"
            />

            <LabeledInputField
              name="maleTicketCapacity"
              label="Male Ticket Capacity*"
              type="number"
              placeholder="Enter male ticket capacity"
              value={maleTicketCapacity}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || parseInt(value) >= 0) {
                  setMaleTicketCapacity(value);
                  setErrors((prev) => ({
                    ...prev,
                    maleTicketCapacity: undefined,
                  }));
                }
              }}
              error={errors.maleTicketCapacity}
              className="w-full "
              min={0}
            />

            <LabeledInputField
              name="femaleTicketCapacity"
              label="Female Ticket Capacity*"
              type="number"
              placeholder="Enter female ticket capacity"
              value={femaleTicketCapacity}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || parseInt(value) >= 0) {
                  setFemaleTicketCapacity(value);
                  setErrors((prev) => ({
                    ...prev,
                    femaleTicketCapacity: undefined,
                  }));
                }
              }}
              error={errors.femaleTicketCapacity}
              className="w-full "
              min={0}
            />

            <LabeledDateTimeField
              name="ticketSalesEndTime"
              label="Ticket Sales End Time*"
              value={timestampToPstString(ticketSalesEndTime)}
              onChange={(e) => {
                handleDateTimeChange(e, setTicketSalesEndTime);
                setErrors((prev) => ({
                  ...prev,
                  ticketSalesEndTime: undefined,
                }));
              }}
              error={errors.ticketSalesEndTime}
              isIOS={isIOSDevice}
            />
          </>
        )}
        <EventFormActions
          isEdit={isEdit}
          isLoading={isSubmitLoading ? isSubmitLoading && isLoading : isLoading}
          isUpdateLoading={isUpdateEventLoading}
          isDeleteLoading={isDeleteLoading}
          saveError={submitError || saveEventError}
          deleteError={deleteError}
          onCancel={() => onCancelEdit?.()}
          onDelete={handleDeleteEvent}
          isSubmitDisabled={isSubmitDisabled}
        />
        <ResponsiveConfirm
          isOpen={showConfirmModal}
          title={modalConfig.title}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          content={modalConfig.message}
          confirmVariant="destructive"
          error={modalConfig.error}
          isLoading={modalConfig.isLoading}
          modalProps={{
            onClose: () => setShowConfirmModal(false),
            onConfirm: modalConfig.onConfirm,
          }}
          drawerProps={{
            onSubmit: modalConfig.onConfirm,
            onOpenChange: (open) => setShowConfirmModal(open),
          }}
        />
      </form>
    </>
  );
};

export default EventForm;
