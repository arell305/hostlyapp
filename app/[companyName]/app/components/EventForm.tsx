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
  EventFormInput,
  EventSchema,
  GuestListFormInput,
  GuestListInfo,
  TicketFormInput,
  TicketInfo,
} from "@/types/types";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import PropsValue from "react-google-places-autocomplete";
import { FaTimes } from "react-icons/fa";
import ResponsiveConfirm from "./responsive/ResponsiveConfirm";
import { PiPlus } from "react-icons/pi";
import { PiMinus } from "react-icons/pi";
import { isIOS } from "../../../../utils/helpers";
import Image from "next/image";
import { RiImageAddFill } from "react-icons/ri";
import imageCompression from "browser-image-compression";

interface EventFormProps {
  initialEventData?: EventSchema;
  initialTicketData?: TicketInfo | null;
  initialGuestListData?: GuestListInfo | null;
  onSubmit: (
    eventData: EventFormInput,
    ticketData: TicketFormInput | null,
    guesListData: GuestListFormInput | null
  ) => Promise<void>;
  isEdit: boolean;
  canAddGuestListOption?: boolean;
  subscriptionTier?: SubscriptionTier;
  deleteTicketInfo?: (eventId: Id<"events">) => Promise<void>;
  deleteGuestListInfo?: (eventId: Id<"events">) => Promise<void>;
  // onCancelEvent?: () => Promise<void>;
  onCancelEdit?: () => void;
  saveEventError?: string | null;
  onSubmitUpdate?: (
    updatedEventData: EventData,
    updatedTicketData: TicketFormInput | null,
    updatedGuestListData: GuestListFormInput | null
  ) => Promise<void>;
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
  saveEventError,
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

  const [address, setAddress] = useState(initialEventData?.address || "");

  const [startTime, setStartTime] = useState(initialEventData?.startTime || "");
  const [endTime, setEndTime] = useState(initialEventData?.endTime || "");
  const [guestListCloseTime, setGuestListCloseTime] = useState<string>(
    initialGuestListData?.guestListCloseTime || ""
  );
  const [checkInCloseTime, setCheckInCloseTime] = useState<string>(
    initialGuestListData?.checkInCloseTime || ""
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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) {
      console.error("No file selected");
      return;
    }

    setIsPhotoLoading(true); // Start photo upload loading

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: compressedFile,
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
        },
      });
      setShowConfirmModal(true);
    } else {
      setIsGuestListSelected(false);
    }
  };

  const onDeleteEvent = async () => {
    try {
      if (initialEventData) {
        await cancelEvent({ eventId: initialEventData?._id });
        toast({
          title: "Event Cancelled",
          description: "The event has been successfully cancelled.",
        });
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

  // const getCurrentTimeInPST = () => {
  //   const pstDate = new Date().toLocaleString("en-US", {
  //     timeZone: "America/Los_Angeles",
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: false,
  //   });

  //   // Format to YYYY-MM-DDTHH:mm
  //   const [date, time] = pstDate.split(", ");
  //   const [month, day, year] = date.split("/");
  //   // Format to YYYY-MM-DDTHH:mm
  //   return `${year}-${month}-${day}T${time}`;
  // };

  // useEffect(() => {
  //   // Set the initial startTime to the current time in PST
  //   setStartTime(getCurrentTimeInPST());
  // }, []);

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
    checkInCloseTime?: string;
    address?: string;
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

    if (address.trim() === "") {
      setErrors((prev) => ({ ...prev, address: "Address must be filled." }));
      hasErrors = true;
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

      if (checkInCloseTime.trim() === "") {
        setErrors((prev) => ({
          ...prev,
          checkInCloseTime: "Check in close time must be selected.",
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
        address: address.trim(),
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

      const guestListData = isGuestListSelected
        ? {
            guestListCloseTime,
            checkInCloseTime,
          }
        : null;

      await onSubmit(eventData, ticketData, guestListData);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: "error submitting event",
      }));
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

  const isIOSDevice = isIOS();
  return (
    <>
      {isCalendarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsCalendarOpen(false)} // Close on clicking outside
        ></div>
      )}
      <form onSubmit={handleSubmit} className=" py-4">
        <div className="mb-6 relative px-4">
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
          <div className="flex ">
            <label
              htmlFor="photo"
              className={`focus:border-customDarkBlue w-[200px] h-[200px] flex justify-center items-center cursor-pointer relative mt-2 rounded-lg hover:bg-gray-100 ${
                displayEventPhoto
                  ? ""
                  : "border-2 border-dashed border-gray-300"
              }`}
            >
              {isPhotoLoading ? (
                // Loading indicator
                <div className="text-gray-500 absolute inset-0 flex items-center justify-center bg-white opacity-75">
                  Loading...
                </div>
              ) : displayEventPhoto ? (
                <img
                  src={displayEventPhoto}
                  alt="Event Photo"
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                // <span className="text-gray-500">Upload Photo</span>
                <RiImageAddFill className="text-4xl text-gray-500" />
              )}

              {/* Remove button */}
            </label>
            {displayEventPhoto && (
              <BsFillXCircleFill
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto();
                }}
                className="text-gray-500 text-3xl rounded-full p-1 cursor-pointer z-10 -ml-3 -mt-2"
              />
            )}
          </div>
        </div>
        <div className="flex flex-col mb-6 px-4">
          <Label
            htmlFor="eventName"
            className="font-bold font-playfair text-lg"
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
        <div className="mb-6 px-4">
          <Label className="" htmlFor="description">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full max-w-[500px] mt-1"
            placeholder="Add a description for your event."
            rows={6}
          />
        </div>
        <div className="mb-6 flex flex-col relative justify-center max-w-[540px] px-4">
          <Label htmlFor="address" className="font-semibold">
            Address*
          </Label>
          <GooglePlacesAutocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            selectProps={{
              className: "ios-input-fix",
              onChange: handleSelect,
              defaultInputValue: address,
              placeholder: "Enter an address",
              styles: {
                container: (provided) => ({
                  ...provided,
                }),
                control: (provided, state) => ({
                  ...provided,
                  border: "0px",
                  borderBottom: `2px solid ${state.isFocused ? "#324E78" : "#D1D5DB"}`,
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  "&:hover": {
                    borderBottomColor: state.isFocused ? "#324E78" : "#D1D5DB",
                    borderRadius: "0",
                  },
                  maxWidth: "500px",
                  borderRadius: "0",
                  padding: "0",
                  paddingRight: "10px",
                  minHeight: "auto", // Allows the control to grow with content
                  height: "auto",
                }),
                input: (provided) => ({
                  ...provided,
                  color: "#374151",

                  paddingLeft: "0", // Remove left padding
                  marginLeft: "0", // Remove left margin
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: "#9CA3AF",
                  paddingLeft: "0", // Ensure no left padding for placeholder
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "#374151",
                  whiteSpace: "normal", // Allows text to wrap
                  wordWrap: "break-word",
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
                option: (provided) => ({
                  ...provided,
                  paddingLeft: "10px", // Add left padding to suggestions
                }),
              },
            }}
          />
          {/* Clear Button */}
          {value && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute right-2 md:right-4 -bottom-4 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          )}

          {errors.address && <p className="text-red-500">{errors.startTime}</p>}
        </div>
        <div className="mb-6 flex flex-col relative  px-4">
          <Label htmlFor="startTime">Starts*</Label>
          <div className="relative">
            <Input
              type="datetime-local"
              id="startTime"
              value={utcToPstString(startTime) || ""}
              onChange={(e) => handleDateTimeChange(e, setStartTime)}
              className={`w-full max-w-[500px] h-10  ${!startTime && isIOSDevice ? "text-transparent" : ""}`}
              error={errors.startTime}
            />
            {!startTime && isIOSDevice && (
              <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                Select date and time
              </span>
            )}
          </div>
          {errors.startTime && (
            <p className="text-red-500">{errors.startTime}</p>
          )}
        </div>
        <div className="mb-6 flex flex-col px-4">
          <Label htmlFor="endTime">Ends*</Label>
          <div className="relative">
            <Input
              type="datetime-local"
              id="endTime"
              value={utcToPstString(endTime) || ""}
              onChange={(e) => handleDateTimeChange(e, setEndTime)}
              className={`w-full max-w-[500px] h-10 ${!endTime && isIOSDevice ? "text-transparent" : ""}`}
              error={errors.endTime}
            />
            {!endTime && isIOSDevice && (
              <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                Select date and time
              </span>
            )}
          </div>
          {errors.endTime && <p className="text-red-500">{errors.endTime}</p>}
        </div>
        {canAddGuestListOption && (
          <div
            className="mt-12 border-b pb-2 mb-6 pt-2 cursor-pointer md:rounded hover:bg-gray-100"
            onClick={() => {
              if (isGuestListSelected) {
                handleRemoveGuestList();
              } else {
                setIsGuestListSelected(true);
              }
            }}
          >
            <div className="flex justify-between px-4">
              <h2 className=" text-lg">GUEST LIST OPTION</h2>
              {isGuestListSelected ? (
                <PiMinus className="text-2xl" />
              ) : (
                <PiPlus className="text-2xl" />
              )}
            </div>
          </div>
        )}
        {isGuestListSelected && (
          <>
            <div className="mb-6 flex flex-col px-4">
              <Label htmlFor="guestListCloseTime">
                Guest List Upload Close Time*
              </Label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  id="guestListCloseTime"
                  value={utcToPstString(guestListCloseTime) || ""}
                  onChange={(e) =>
                    handleDateTimeChange(e, setGuestListCloseTime)
                  }
                  className={`w-full max-w-[500px] h-10  ${!guestListCloseTime && isIOSDevice ? "text-transparent" : ""}`}
                  error={errors.guestListCloseTime}
                />
                {!guestListCloseTime && isIOSDevice && (
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    Select date and time
                  </span>
                )}
              </div>
              {errors.guestListCloseTime && (
                <p className="text-red-500">{errors.guestListCloseTime}</p>
              )}
            </div>
            <div className="mb-6 flex flex-col px-4">
              <Label htmlFor="checkInCloseTime">Check In Close Time*</Label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  id="checkInCloseTime"
                  value={utcToPstString(checkInCloseTime) || ""}
                  onChange={(e) => handleDateTimeChange(e, setCheckInCloseTime)}
                  className={`w-full max-w-[500px] h-10  ${!checkInCloseTime && isIOSDevice ? "text-transparent" : ""}`}
                  error={errors.checkInCloseTime}
                />
                {!checkInCloseTime && isIOSDevice && (
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    Select date and time
                  </span>
                )}
              </div>
              {errors.checkInCloseTime && (
                <p className="text-red-500">{errors.checkInCloseTime}</p>
              )}
            </div>
          </>
        )}
        <div
          className="mb-6 mt-12 border-b pb-2 pt-2 cursor-pointer md:rounded hover:bg-gray-100"
          onClick={() => {
            if (isTicketsSelected) {
              handleRemoveTickets();
            } else {
              setIsTicketsSelected(true);
            }
          }}
        >
          <div className="flex justify-between px-4">
            <h2 className="text-lg">TICKET OPTION</h2>
            {isTicketsSelected ? (
              <PiMinus className="text-2xl" />
            ) : (
              <PiPlus className="text-2xl" />
            )}
          </div>
        </div>
        {isTicketsSelected && (
          <>
            <div className="mb-6 flex flex-col px-4">
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

            <div className="mb-6 flex flex-col px-4">
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

            <div className="mb-6 flex flex-col px-4">
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

            <div className="mb-6 flex flex-col px-4">
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
            <div className="mb-6 flex flex-col px-4">
              <Label htmlFor="ticketSalesEndTime">Ticket Sales End Time*</Label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  id="ticketSalesEndTime"
                  value={utcToPstString(ticketSalesEndTime) || ""}
                  onChange={(e) =>
                    handleDateTimeChange(e, setTicketSalesEndTime)
                  }
                  className={`w-full max-w-[500px] h-10  ${!ticketSalesEndTime && isIOSDevice ? "text-transparent" : ""}`}
                  error={errors.ticketSalesEndTime}
                />
                {!ticketSalesEndTime && isIOSDevice && (
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    Select date and time
                  </span>
                )}
              </div>
              {errors.ticketSalesEndTime && (
                <p className="text-red-500">{errors.ticketSalesEndTime}</p>
              )}
            </div>
          </>
        )}
        {saveEventError && (
          <p className="text-red-500 pl-4">{saveEventError}</p>
        )}{" "}
        <div
          className={`px-4  mt-12 flex ${isEdit ? "flex-col gap-y-3 mb-12 md:flex-row md:gap-x-10" : "flex-row gap-x-2 mb-6"} items-center justify-center`}
        >
          <Button
            variant={isEdit ? "secondary" : "ghost"}
            type="button"
            onClick={onCancelEdit}
            disabled={isLoading}
            size={isEdit ? "tripleButtons" : "doubelButtons"}
            className="w-full"
          >
            {isEdit ? "Cancel Editing" : "Cancel"}
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            size={isEdit ? "tripleButtons" : "doubelButtons"}
            variant="default"
            className="w-full"
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
              size="tripleButtons"
              className="w-full border-red-700 text-red-700 "
              variant="secondary"
            >
              Delete Event
            </Button>
          )}
        </div>
        <ResponsiveConfirm
          isOpen={showConfirmModal}
          title={modalConfig.title}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          content={modalConfig.message}
          confirmVariant="destructive"
          error={null}
          isLoading={false}
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