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
import { Loader2 } from "lucide-react";
import { BsFillXCircleFill } from "react-icons/bs";
import { EventData, EventFormData, GuestListInfo, TicketInfo } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface EventFormProps {
  initialEventData?: EventData;
  initialTicketData?: TicketInfo | null;
  initialGuestListData?: GuestListInfo | null;
  onSubmit: (
    eventData: any,
    ticketData: any,
    guesListData: any
  ) => Promise<void>;
  isEdit: boolean;
  canAddGuestListOption?: boolean;
  subscriptionTier?: SubscriptionTier;
  deleteTicketInfo?: (eventId: Id<"events">) => Promise<void>;
  deleteGuestListInfo?: (eventId: Id<"events">) => Promise<void>;
  // onCancelEvent?: () => Promise<void>;
  onCancelEdit?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  initialEventData,
  initialTicketData,
  initialGuestListData,
  onSubmit,
  isEdit,
  canAddGuestListOption, // use Clerk
  subscriptionTier,
  deleteTicketInfo,
  // onCancelEvent,
  deleteGuestListInfo,
  onCancelEdit,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    eventName: initialEventData?.name || "",
    description: initialEventData?.description || "",
    venueName: initialEventData?.venue?.venueName || "",
    address: initialEventData?.venue?.address || "",
    startTime: initialEventData?.startTime || "",
    endTime: initialEventData?.endTime || "",
    guestListCloseTime: initialGuestListData?.guestListCloseTime || null,
    maleTicketPrice: initialTicketData?.maleTicketPrice.toString() || null,
    femaleTicketPrice: initialTicketData?.femaleTicketPrice.toString() || null,
    maleTicketCapacity:
      initialTicketData?.maleTicketCapacity.toString() || null,
    femaleTicketCapacity:
      initialTicketData?.femaleTicketCapacity.toString() || null,
    ticketSalesEndTime: initialTicketData?.ticketSalesEndTime || null,
    photoStorageId: initialEventData?.photo || null,
  });

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
  const cancelEvent = useMutation(api.events.cancelEvent);
  const router = useRouter();

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

  const onDeleteEvent = async () => {
    console.log("id", initialEventData?._id);
    try {
      const navigationPromise = router.push("/");
      if (initialEventData) {
        await cancelEvent({ eventId: initialEventData?._id });
        toast({
          title: "Event Cancelled",
          description: "The event has been successfully cancelled.",
        });
        navigationPromise;
      }
    } catch (error) {
      console.error("Error cancelling event:", error);
      toast({
        title: "Error",
        description: "Failed to cancel the event. Please try again.",
        variant: "destructive",
      });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 flex flex-col">
        <Label htmlFor="eventName" className="font-bold font-playfair text-xl">
          Name*
        </Label>
        <Input
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="w-full max-w-[500px]"
          error={errors.eventName}
          placeholder="Enter event name"
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
          placeholder="Add a description for your event."
        />
      </div>
      {/* 
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
      </div> */}
      <div className="space-y-2">
        <Label htmlFor="photo" className="font-bold">
          Event Photo
        </Label>

        {/* Hidden file input */}
        <input
          type="file"
          id="photo"
          onChange={handlePhotoChange}
          accept="image/*"
          className="hidden" // Hide the default file input
        />

        {/* Custom upload button */}
        <label
          htmlFor="photo"
          className="focus:border-customDarkBlue w-full max-w-[500px] border-2 border-dashed border-gray-300 h-[300px] flex justify-center items-center cursor-pointer relative mt-2 rounded-lg"
        >
          {displayEventPhoto ? (
            <img
              src={displayEventPhoto}
              alt="Event Photo"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-500">Upload Photo</span>
          )}

          {/* Loading indicator */}
          {isPhotoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white opacity-75">
              Loading...
            </div>
          )}

          {/* Remove button */}
          {displayEventPhoto && (
            <BsFillXCircleFill
              onClick={handleRemovePhoto}
              className="absolute -top-[22px] -right-[22px] text-4xl rounded-full p-1"
            />
          )}
        </label>
      </div>

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="venueName">Venue Name</Label>
        <Input
          id="venueName"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          className="w-full max-w-[500px]"
        />
      </div>

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full max-w-[500px]"
        />
      </div>

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="startTime">Starts*</Label>
        <Input
          type="datetime-local"
          id="startTime"
          value={utcToPstString(startTime) || ""}
          onChange={(e) => handleDateTimeChange(e, setStartTime)}
          className="w-full max-w-[500px]"
          error={errors.startTime}
        />
        {errors.startTime && <p className="text-red-500">{errors.startTime}</p>}
      </div>

      <div className="space-y-2 flex flex-col">
        <Label htmlFor="endTime">Ends*</Label>
        <Input
          type="datetime-local"
          id="endTime"
          value={utcToPstString(endTime) || ""}
          onChange={(e) => handleDateTimeChange(e, setEndTime)}
          className="w-full max-w-[500px]"
          error={errors.endTime}
        />
        {errors.endTime && <p className="text-red-500">{errors.endTime}</p>}
      </div>
      {canAddGuestListOption && (
        <div className="space-y-2">
          <Button
            type="button"
            className={`relative rounded-[20px] border border-customDarkBlue 
            ${isGuestListSelected ? "bg-customDarkBlue text-white" : "text-customDarkBlue"}`}
            onClick={
              isGuestListSelected
                ? handleRemoveGuestList
                : () => setIsGuestListSelected(true)
            }
            variant="outline"
          >
            {isGuestListSelected ? "Remove Guest List" : "Add Guest List"}
            {isGuestListSelected && (
              <span
                className="absolute -top-2 -right-[8px] cursor-pointer"
                onClick={handleRemoveTickets}
              >
                <BsFillXCircleFill className="text-black text-xl " />
              </span>
            )}
          </Button>
        </div>
      )}

      {isGuestListSelected && (
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="guestListCloseTime">Guest List Close Time*</Label>
          <Input
            type="datetime-local"
            id="guestListCloseTime"
            value={utcToPstString(guestListCloseTime) || ""}
            onChange={(e) => handleDateTimeChange(e, setGuestListCloseTime)}
            className="w-full max-w-[500px]"
            error={errors.guestListCloseTime}
          />
          {errors.guestListCloseTime && (
            <p className="text-red-500">{errors.guestListCloseTime}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Button
          type="button"
          className={`relative rounded-[20px] border border-customDarkBlue 
      ${isTicketsSelected ? "bg-customDarkBlue text-white" : "text-customDarkBlue"}`}
          onClick={
            isTicketsSelected
              ? handleRemoveTickets
              : () => setIsTicketsSelected(true)
          }
          variant="outline"
        >
          {isTicketsSelected ? "Remove Tickets" : "Add Tickets"}
          {isTicketsSelected && (
            <span
              className="absolute -top-2 -right-[8px] cursor-pointer"
              onClick={handleRemoveTickets}
            >
              <BsFillXCircleFill className="text-black text-xl" />
            </span>
          )}
        </Button>
      </div>

      {isTicketsSelected && (
        <>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="maleTicketPrice">Male Ticket Price*</Label>
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
              error={errors.maleTicketPrice}
            />
            {errors.maleTicketPrice && (
              <p className="text-red-500">{errors.maleTicketPrice}</p>
            )}
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="femaleTicketPrice">Female Ticket Price*</Label>
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
              error={errors.femaleTicketPrice}
            />
            {errors.femaleTicketPrice && (
              <p className="text-red-500">{errors.femaleTicketPrice}</p>
            )}
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="maleTicketCapacity">Male Ticket Capacity*</Label>
            <Input
              type="number"
              id="maleTicketCapacity"
              value={maleTicketCapacity}
              onChange={(e) => setMaleTicketCapacity(e.target.value)}
              className="w-full max-w-[500px]"
              min="0"
              defaultValue="0"
              error={errors.maleTicketCapacity}
            />
            {errors.maleTicketCapacity && (
              <p className="text-red-500">{errors.maleTicketCapacity}</p>
            )}
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="femaleTicketCapacity">
              Female Ticket Capacity*
            </Label>
            <Input
              type="number"
              id="femaleTicketCapacity"
              value={femaleTicketCapacity}
              onChange={(e) => setFemaleTicketCapacity(e.target.value)}
              className="w-full max-w-[500px]"
              min="0"
              defaultValue="0"
              error={errors.femaleTicketCapacity}
            />
            {errors.femaleTicketCapacity && (
              <p className="text-red-500">{errors.femaleTicketCapacity}</p>
            )}
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="ticketSalesEndTime">Ticket Sales End Time*</Label>
            <Input
              type="datetime-local"
              id="ticketSalesEndTime"
              value={utcToPstString(ticketSalesEndTime) || ""}
              onChange={(e) => handleDateTimeChange(e, setTicketSalesEndTime)}
              className="w-full max-w-[500px]"
              error={errors.ticketSalesEndTime}
            />
            {errors.ticketSalesEndTime && (
              <p className="text-red-500">{errors.ticketSalesEndTime}</p>
            )}
          </div>
        </>
      )}
      {/* 
      <Button type="submit" disabled={isLoading}>
        {isEdit ? "Update Event" : "Add Event"}
      </Button> */}
      <div
        className={`flex ${isEdit ? "flex-col" : "flex-row"} items-center justify-center  space-y-2`}
      >
        {" "}
        <Button
          variant="secondary"
          type="button"
          onClick={onCancelEdit}
          disabled={isLoading}
          size={isEdit ? "tripleButtons" : "doubelButtons"}
        >
          Cancel Editing
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          size={isEdit ? "tripleButtons" : "doubelButtons"}
          variant="default"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEdit ? (
            "Update Event"
          ) : (
            "Add Event"
          )}
        </Button>
        {isEdit && (
          <Button
            type="button"
            onClick={handleDeleteEvent}
            variant="destructive"
            size="tripleButtons"
          >
            Delete Event
          </Button>
        )}
      </div>
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
