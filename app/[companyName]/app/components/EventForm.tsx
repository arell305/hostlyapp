import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isAfter } from "date-fns";
import { SubscriptionTier } from "../../../../utils/enum";
import { Id } from "../../../../convex/_generated/dataModel";
import ConfirmModal from "./ConfirmModal";
import { DateTime } from "luxon";
import { generateUploadUrl } from "../../../../convex/photo";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import { BsFillXCircleFill } from "react-icons/bs";
import {
  EventData,
  EventFormData,
  GuestListInfo,
  TicketInfo,
} from "@/types/types";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import PropsValue from "react-google-places-autocomplete";
import { FaTimes } from "react-icons/fa";

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

interface AddressValue {
  label: string; // The display value of the address
  value: {
    description: string; // Full address as a string
    place_id: string; // Google Place ID
    structured_formatting: {
      main_text: string; // Main part of the address
      secondary_text: string; // Additional details of the address
    };
  };
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
  // GOOGLE
  const [value, setValue] = useState<AddressValue | null>(null);
  const handleSelect = (value: AddressValue | null) => {
    setValue(value);
    if (value) {
      setAddress(value.label);
    }
  };
  const clearInput = () => {
    setValue(null);
    if (value) {
      setAddress(value.label);
    }
  };

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

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleFocus = () => setIsCalendarOpen(true);
  const handleBlur = () => setIsCalendarOpen(false);
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
    <>
      {isCalendarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsCalendarOpen(false)} // Close on clicking outside
        ></div>
      )}
      <form onSubmit={handleSubmit} className=" p-4">
        <div className="flex flex-col mb-4">
          <Label
            htmlFor="eventName"
            className="font-bold font-playfair text-xl"
          >
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
          {errors.eventName && (
            <p className="text-red-500">{errors.eventName}</p>
          )}
        </div>

        <div className="mb-4">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full max-w-[500px]"
            placeholder="Add a description for your event."
          />
        </div>

        <div className="mb-4 relative">
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
          <div className="flex">
            <label
              htmlFor="photo"
              className="focus:border-customDarkBlue  w-[300px] border-2 border-dashed border-gray-300 h-[450px] flex justify-center items-center cursor-pointer relative mt-2 rounded-lg"
            >
              {isPhotoLoading ? (
                // Loading indicator
                <div className="absolute inset-0 flex items-center justify-center bg-white opacity-75">
                  Loading...
                </div>
              ) : displayEventPhoto ? (
                <img
                  src={displayEventPhoto}
                  alt="Event Photo"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-500">Upload Photo</span>
              )}

              {/* Remove button */}
            </label>
            {displayEventPhoto && (
              <BsFillXCircleFill
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto();
                }}
                className=" text-4xl rounded-full p-1 cursor-pointer z-10 -ml-4 -mt-3"
              />
            )}
          </div>
        </div>

        <div className="mb-4 flex flex-col ">
          <Label htmlFor="venueName">Venue Name*</Label>
          <Input
            id="venueName"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            className="w-full max-w-[500px]"
            placeholder="Enter venue name"
          />
        </div>

        <div className="mb-4 flex flex-col relative justify-center ">
          <Label htmlFor="address" className="font-semibold">
            Address*
          </Label>
          <GooglePlacesAutocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            selectProps={{
              value,
              onChange: handleSelect,
              placeholder: "Enter an address",
              styles: {
                control: (provided, state) => ({
                  ...provided,
                  border: "0px",
                  borderBottom: `2px solid ${state.isFocused ? "#324E78" : "#D1D5DB"}`,
                  backgroundColor: "transparent",
                  padding: "0.25rem 0",
                  boxShadow: "none",
                  "&:hover": {
                    borderBottomColor: state.isFocused ? "#324E78" : "#D1D5DB",
                  },
                  maxWidth: "500px",
                }),
                input: (provided) => ({
                  ...provided,
                  color: "#374151",
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: "#9CA3AF",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "#374151",
                }),
                dropdownIndicator: (provided) => ({
                  ...provided,
                  display: "none",
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 9999, // Ensures suggestions appear above everything
                  position: "absolute", // Avoids inheriting parent position
                }),
                menuPortal: (provided) => ({
                  ...provided,
                  zIndex: 9999, // Required for React-Select portals
                }),
              },
            }}
          />
          {/* Clear Button */}
          {value && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute right-0 top-10 p-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          )}
        </div>
        {/* <div className="space-y-2 flex flex-col">
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
      </div> */}
        <div className="mb-4 flex flex-col relative z-50">
          <Label htmlFor="startTime">Starts*</Label>
          <Input
            type="datetime-local"
            id="startTime"
            value={utcToPstString(startTime) || ""}
            onChange={(e) => handleDateTimeChange(e, setStartTime)}
            className={`w-full max-w-[500px] ${isCalendarOpen ? "" : ""}`}
            error={errors.startTime}
          />
          {errors.startTime && (
            <p className="text-red-500">{errors.startTime}</p>
          )}
        </div>

        <div className="mb-4 flex flex-col">
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
          <div className="mb-4">
            <Button
              type="button"
              className={`w-[160px]  relative rounded-[20px] border border-customDarkBlue 
            text-customDarkBlue ${isGuestListSelected ? "bg-gray-100" : ""}`}
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
                  className="absolute -top-2 -right-[9px] cursor-pointer"
                  onClick={handleRemoveTickets}
                >
                  <BsFillXCircleFill className="text-customDarkBlue  text-xl " />
                </span>
              )}
            </Button>
          </div>
        )}

        {isGuestListSelected && (
          <div className="mb-4 flex flex-col">
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

        <div className="mb-4 ">
          <Button
            type="button"
            className={`${isTicketsSelected ? "bg-gray-100" : ""} w-[160px] 0 relative rounded-[20px] border border-customDarkBlue 
       text-customDarkBlue`}
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
                className="absolute -top-2 -right-[9px] cursor-pointer"
                onClick={handleRemoveTickets}
              >
                <BsFillXCircleFill className="text-customDarkBlue text-xl" />
              </span>
            )}
          </Button>
        </div>

        {isTicketsSelected && (
          <>
            <div className="mb-4 flex flex-col">
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
                placeholder="Enter male ticket price"
              />
              {errors.maleTicketPrice && (
                <p className="text-red-500">{errors.maleTicketPrice}</p>
              )}
            </div>

            <div className="mb-4 flex flex-col">
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
                placeholder="Enter female ticket price"
              />
              {errors.femaleTicketPrice && (
                <p className="text-red-500">{errors.femaleTicketPrice}</p>
              )}
            </div>

            <div className="mb-4 flex flex-col">
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
                placeholder="Enter male ticket capacity"
              />
              {errors.maleTicketCapacity && (
                <p className="text-red-500">{errors.maleTicketCapacity}</p>
              )}
            </div>

            <div className="mb-4 flex flex-col">
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
                placeholder="Enter female ticket capacity"
              />
              {errors.femaleTicketCapacity && (
                <p className="text-red-500">{errors.femaleTicketCapacity}</p>
              )}
            </div>
            <div className="mb-4 flex flex-col">
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
          className={`flex ${isEdit ? "flex-col gap-y-1.5" : "flex-row gap-x-2"} items-center justify-center`}
        >
          {" "}
          <Button
            variant={isEdit ? "secondary" : "ghost"}
            type="button"
            onClick={onCancelEdit}
            disabled={isLoading}
            size={isEdit ? "tripleButtons" : "doubelButtons"}
          >
            {isEdit ? "Cancel Editing" : "Cancel"}
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
              "Create"
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
    </>
  );
};

export default EventForm;
