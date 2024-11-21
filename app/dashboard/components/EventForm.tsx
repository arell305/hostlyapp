import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isAfter } from "date-fns";
import { SubscriptionTier } from "../../../utils/enum";
import { Id } from "../../../convex/_generated/dataModel";
import ConfirmModal from "./ConfirmModal";
import { DateTime } from "luxon";
import { generateUploadUrl } from "../../../convex/photo";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface EventFormProps {
  initialEventData?: {
    name: string;
    description: string | null;
    startTime: string;
    endTime: string;
    photo: Id<"_storage"> | null;
    venue?: {
      venueName?: string;
      address?: string;
    };
  };
  initialTicketData?: {
    maleTicketPrice: number;
    femaleTicketPrice: number;
    maleTicketCapacity: number;
    femaleTicketCapacity: number;
    ticketSalesEndTime: string;
  } | null;
  initialGuestListData?: {
    guestListCloseTime: string;
  } | null;
  onSubmit: (
    eventData: any,
    ticketData: any,
    guesListData: any
  ) => Promise<void>;
  isEdit: boolean;
  canAddGuestListOption: boolean;
  subscriptionTier?: SubscriptionTier;
  deleteTicketInfo?: (eventId: Id<"events">) => Promise<void>;
  deleteGuestListInfo?: (eventId: Id<"events">) => Promise<void>;
  eventId?: Id<"events">;
  onCancelEvent?: () => Promise<void>;
}

const EventForm: React.FC<EventFormProps> = ({
  initialEventData,
  initialTicketData,
  initialGuestListData,
  onSubmit,
  isEdit,
  canAddGuestListOption,
  subscriptionTier,
  deleteTicketInfo,
  eventId,
  onCancelEvent,
  deleteGuestListInfo,
}) => {
  const defaultTime = "22:00";
  // Event state
  const [eventName, setEventName] = useState(initialEventData?.name || "");
  const [description, setDescription] = useState(
    initialEventData?.description || ""
  );
  const [venueName, setVenueName] = useState(
    initialEventData?.venue?.venueName || ""
  );
  const [address, setAddress] = useState(
    initialEventData?.venue?.address || ""
  );

  const [startTime, setStartTime] = useState(initialEventData?.startTime || "");
  const [endTime, setEndTime] = useState(initialEventData?.endTime || "");
  const [guestListCloseTime, setGuestListCloseTime] = useState<string | null>(
    initialGuestListData?.guestListCloseTime || null
  );
  const generateUploadUrl = useMutation(api.photo.generateUploadUrl);
  const [photoStorageId, setPhotoStorageId] = useState<Id<"_storage"> | null>(
    initialEventData?.photo || null
  );
  const [isPhotoLoading, setIsPhotoLoading] = useState<boolean>(false);
  const displayEventPhoto = useQuery(api.photo.getFileUrl, {
    storageId: photoStorageId,
  });
  //modal for removal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {},
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) {
      console.error("No file selected");
      return;
    }

    setIsPhotoLoading(true); // Start photo upload loading

    try {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (result.ok) {
        const { storageId } = await result.json();
        setPhotoStorageId(storageId as Id<"_storage">);
      } else {
        console.error("Photo upload failed");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setIsPhotoLoading(false); // Stop loading after the upload is finished
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
          setGuestListCloseTime(null);
        },
      });
      setShowConfirmModal(true);
    } else {
      setIsGuestListSelected(false);
    }
  };

  const handleCancelEventClick = () => {
    setModalConfig({
      title: "Confirm Event Deletion",
      message:
        "Are you sure you want to delete this event? This action cannot be undone.",
      confirmText: "Delete Event",
      cancelText: "Keep Event",
      onConfirm: async () => {
        if (onCancelEvent) {
          await onCancelEvent();
        }
        setShowConfirmModal(false);
      },
    });
    setShowConfirmModal(true);
  };

  const getCurrentTimeInPST = () => {
    const pstDate = new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Format to YYYY-MM-DDTHH:mm
    const [date, time] = pstDate.split(", ");
    const [month, day, year] = date.split("/");
    // Format to YYYY-MM-DDTHH:mm
    return `${year}-${month}-${day}T${time}`;
  };

  useEffect(() => {
    // Set the initial startTime to the current time in PST
    setStartTime(getCurrentTimeInPST());
  }, []);

  // Ticket state
  const [maleTicketPrice, setMaleTicketPrice] = useState(
    initialTicketData?.maleTicketPrice.toString() || ""
  );
  const [femaleTicketPrice, setFemaleTicketPrice] = useState(
    initialTicketData?.femaleTicketPrice.toString() || ""
  );
  const [maleTicketCapacity, setMaleTicketCapacity] = useState(
    initialTicketData?.maleTicketCapacity.toString() || ""
  );
  const [femaleTicketCapacity, setFemaleTicketCapacity] = useState(
    initialTicketData?.femaleTicketCapacity.toString() || ""
  );

  const [ticketSalesEndTime, setTicketSalesEndTime] = useState(
    initialTicketData?.ticketSalesEndTime || ""
  );

  // Selection state
  const [isGuestListSelected, setIsGuestListSelected] =
    useState(!!initialGuestListData);
  const [isTicketsSelected, setIsTicketsSelected] =
    useState(!!initialTicketData);

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
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const priceRegex = /^\d*\.?\d{0,2}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    let hasErrors = false;
    const now = new Date();

    if (eventName.trim() === "") {
      setErrors((prev) => ({ ...prev, eventName: "Name must be filled." }));
      hasErrors = true;
    }

    if (startTime.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        startTime: "Start Time must be filled.",
      }));
      hasErrors = true;
    }
    if (endTime.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        endTime: "End Time must be filled.",
      }));
      hasErrors = true;
    } else {
      if (!isAfter(endTime, startTime)) {
        setErrors((prev) => ({
          ...prev,
          endTime: "End Time must be after Start Time.",
        }));
        hasErrors = true;
      }
    }

    if (isTicketsSelected) {
      if (maleTicketPrice.trim() === "" || parseFloat(maleTicketPrice) < 0) {
        setErrors((prev) => ({
          ...prev,
          maleTicketPrice: "Male ticket price must be valid.",
        }));
        hasErrors = true;
      }
      if (
        femaleTicketPrice.trim() === "" ||
        parseFloat(femaleTicketPrice) < 0
      ) {
        setErrors((prev) => ({
          ...prev,
          femaleTicketPrice: "Female ticket price must be valid.",
        }));
        hasErrors = true;
      }
      if (
        maleTicketCapacity.trim() === "" ||
        parseInt(maleTicketCapacity) < 0
      ) {
        setErrors((prev) => ({
          ...prev,
          maleTicketCapacity: "Male ticket capacity must be valid.",
        }));
        hasErrors = true;
      }
      if (
        femaleTicketCapacity.trim() === "" ||
        parseInt(femaleTicketCapacity) < 0
      ) {
        setErrors((prev) => ({
          ...prev,
          femaleTicketCapacity: "Female ticket capacity must be valid.",
        }));
        hasErrors = true;
      }
      if (ticketSalesEndTime.trim() === "") {
        setErrors((prev) => ({
          ...prev,
          ticketSalesEndTime: "Ticket sales time must be selected",
        }));
      } else if (isAfter(ticketSalesEndTime, endTime)) {
        setErrors((prev) => ({
          ...prev,
          ticketSalesEndTime:
            "Ticket sales time must be before or equal to the event end time.",
        }));
        hasErrors = true;
      }
    }

    if (isGuestListSelected) {
      if (guestListCloseTime === null || guestListCloseTime === "") {
        setErrors((prev) => ({
          ...prev,
          guestListCloseTime: "Guest list close time must be selected.",
        }));
        hasErrors = true;
      } else if (isAfter(guestListCloseTime, endTime)) {
        setErrors((prev) => ({
          ...prev,
          guestListCloseTime:
            "Guest list close time must be before or equal to the event end time.",
        }));
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return;
    }
    setIsLoading(true);
    try {
      const eventData = {
        name: eventName,
        description: description.trim() !== "" ? description : null,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        photo: photoStorageId || null,
        venue: {
          venueName,
          address,
        },
      };

      const ticketData = isTicketsSelected
        ? {
            maleTicketPrice: parseFloat(maleTicketPrice) || 0,
            femaleTicketPrice: parseFloat(femaleTicketPrice) || 0,
            maleTicketCapacity: parseInt(maleTicketCapacity) || 0,
            femaleTicketCapacity: parseInt(femaleTicketCapacity) || 0,
            ticketSalesEndTime,
          }
        : null;

      const guesListData = isGuestListSelected
        ? {
            guestListCloseTime,
          }
        : null;
      await onSubmit(eventData, ticketData, guesListData);
    } catch (error) {
      console.error("Error submitting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const utcToPstString = (utcDate: string | null) => {
    if (!utcDate) return "";
    return DateTime.fromISO(utcDate, { zone: "UTC" })
      .setZone("America/Los_Angeles")
      .toISO({ includeOffset: false }); // Exclude offset for datetime-local format
  };

  const handleDateTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const userInput = e.target.value; // e.g., "2024-11-01T02:30"

    // Interpret the input directly as PST (without shifting)
    const pstDateTime = DateTime.fromISO(userInput, {
      zone: "America/Los_Angeles",
    });

    // Log to verify it's treated as PST
    console.log("Input treated as PST:", pstDateTime.toString());

    // Convert to UTC for backend consistency, if needed
    const utcDateTime = pstDateTime.toUTC().toISO();
    setter(utcDateTime || "");
  };

  console.log("canAddGuestListOption", canAddGuestListOption);
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="eventName">Event Name</Label>
        <Input
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="w-full max-w-[500px]"
        />
        {errors.eventName && <p className="text-red-500">{errors.eventName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full max-w-[500px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo">Event Photo</Label>
        <Input
          type="file"
          id="photo"
          onChange={handlePhotoChange}
          accept="image/*"
          className="w-full max-w-[500px]"
        />
        {isPhotoLoading && <div>Loading</div>}
        {displayEventPhoto && (
          <div className="relative mt-2 max-w-[300px]">
            <img
              src={displayEventPhoto}
              alt="Event Photo"
              className="w-full h-auto"
            />
            <button
              onClick={handleRemovePhoto}
              className="absolute top-0 right-0 bg-black text-white rounded-full p-1"
            >
              X
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="venueName">Venue Name</Label>
        <Input
          id="venueName"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          className="w-full max-w-[500px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full max-w-[500px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startTime">Starts</Label>
        <Input
          type="datetime-local"
          id="startTime"
          value={utcToPstString(startTime) || ""}
          onChange={(e) => handleDateTimeChange(e, setStartTime)}
          className="w-full max-w-[500px]"
        />
        {errors.startTime && <p className="text-red-500">{errors.startTime}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="endTime">Ends</Label>
        <Input
          type="datetime-local"
          id="endTime"
          value={utcToPstString(endTime) || ""}
          onChange={(e) => handleDateTimeChange(e, setEndTime)}
          className="w-full max-w-[500px]"
        />
        {errors.endTime && <p className="text-red-500">{errors.endTime}</p>}
      </div>
      {canAddGuestListOption && (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={
              isGuestListSelected
                ? handleRemoveGuestList
                : () => setIsGuestListSelected(true)
            }
            variant={isGuestListSelected ? "default" : "outline"}
          >
            {isGuestListSelected ? "Remove Guest List" : "Add Guest List"}
          </Button>
        </div>
      )}

      {isGuestListSelected && (
        <div className="space-y-2">
          <Label htmlFor="guestListCloseTime">Guest List Close Time</Label>
          <Input
            type="datetime-local"
            id="guestListCloseTime"
            value={utcToPstString(guestListCloseTime) || ""}
            onChange={(e) => handleDateTimeChange(e, setGuestListCloseTime)}
            className="w-full max-w-[500px]"
          />
          {errors.guestListCloseTime && (
            <p className="text-red-500">{errors.guestListCloseTime}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Button
          type="button"
          onClick={
            isTicketsSelected
              ? handleRemoveTickets
              : () => setIsTicketsSelected(true)
          }
          variant={isTicketsSelected ? "default" : "outline"}
        >
          {isTicketsSelected ? "Remove Tickets" : "Add Tickets"}
        </Button>
      </div>

      {isTicketsSelected && (
        <>
          <div className="space-y-2">
            <Label htmlFor="maleTicketPrice">Male Ticket Price</Label>
            <Input
              type="number"
              id="maleTicketPrice"
              value={maleTicketPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (priceRegex.test(value) || value === "") {
                  setMaleTicketPrice(value);
                }
              }}
              className="w-full max-w-[500px]"
              min="0"
              defaultValue="0"
            />
            {errors.maleTicketPrice && (
              <p className="text-red-500">{errors.maleTicketPrice}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="femaleTicketPrice">Female Ticket Price</Label>
            <Input
              type="number"
              id="femaleTicketPrice"
              value={femaleTicketPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (priceRegex.test(value) || value === "") {
                  setFemaleTicketPrice(value);
                }
              }}
              className="w-full max-w-[500px]"
              min="0"
              defaultValue="0"
            />
            {errors.femaleTicketPrice && (
              <p className="text-red-500">{errors.femaleTicketPrice}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maleTicketCapacity">Male Ticket Capacity</Label>
            <Input
              type="number"
              id="maleTicketCapacity"
              value={maleTicketCapacity}
              onChange={(e) => setMaleTicketCapacity(e.target.value)}
              className="w-full max-w-[500px]"
              min="0"
              defaultValue="0"
            />
            {errors.maleTicketCapacity && (
              <p className="text-red-500">{errors.maleTicketCapacity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="femaleTicketCapacity">Female Ticket Capacity</Label>
            <Input
              type="number"
              id="femaleTicketCapacity"
              value={femaleTicketCapacity}
              onChange={(e) => setFemaleTicketCapacity(e.target.value)}
              className="w-full max-w-[500px]"
              min="0"
              defaultValue="0"
            />
            {errors.femaleTicketCapacity && (
              <p className="text-red-500">{errors.femaleTicketCapacity}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticketSalesEndTime">Ticket Sales End Time</Label>
            <Input
              type="datetime-local"
              id="ticketSalesEndTime"
              value={utcToPstString(ticketSalesEndTime) || ""}
              onChange={(e) => handleDateTimeChange(e, setTicketSalesEndTime)}
              className="w-full max-w-[500px]"
            />
            {errors.ticketSalesEndTime && (
              <p className="text-red-500">{errors.ticketSalesEndTime}</p>
            )}
          </div>
        </>
      )}

      <Button type="submit" disabled={isLoading}>
        {isEdit ? "Update Event" : "Add Event"}
      </Button>
      {isEdit && (
        <Button
          type="button"
          onClick={handleCancelEventClick}
          variant="destructive"
          className="mt-4"
        >
          Delete Event
        </Button>
      )}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
      />
    </form>
  );
};

export default EventForm;
