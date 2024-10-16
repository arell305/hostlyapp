import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, startOfDay } from "date-fns";
import { SubscriptionTier } from "../../../utils/enum";
import { Id } from "../../../convex/_generated/dataModel";
import ConfirmModal from "./ConfirmModal";

interface EventFormProps {
  initialEventData?: {
    name: string;
    description: string | null;
    date: string;
    startTime: string;
    endTime: string | null;
    guestListCloseTime?: string | null;
    photo: string | null;
  };
  initialTicketData?: {
    maleTicketPrice: number;
    femaleTicketPrice: number;
    maleTicketCapacity: number;
    femaleTicketCapacity: number;
  } | null;
  onSubmit: (eventData: any, ticketData: any) => Promise<void>;
  isEdit: boolean;
  canAddGuestList: boolean;
  subscriptionTier?: SubscriptionTier;
  deleteTicketInfo?: (eventId: Id<"events">) => Promise<void>;
  eventId?: Id<"events">;
}

const EventForm: React.FC<EventFormProps> = ({
  initialEventData,
  initialTicketData,
  onSubmit,
  isEdit,
  canAddGuestList,
  subscriptionTier,
  deleteTicketInfo,
  eventId,
}) => {
  // Event state
  const [eventName, setEventName] = useState(initialEventData?.name || "");
  const [description, setDescription] = useState(
    initialEventData?.description || ""
  );
  const [date, setDate] = useState<Date | undefined>(
    initialEventData?.date ? new Date(initialEventData.date) : undefined
  );
  const [startTime, setStartTime] = useState(initialEventData?.startTime || "");
  const [endTime, setEndTime] = useState(initialEventData?.endTime || "");
  const [guestListCloseTime, setGuestListCloseTime] = useState(
    initialEventData?.guestListCloseTime || ""
  );
  const [photo, setPhoto] = useState<File | null>(null);

  //modal for removal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {},
  });

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
    if (isEdit && initialEventData?.guestListCloseTime) {
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

  // Selection state
  const [isGuestListSelected, setIsGuestListSelected] = useState(
    !!initialEventData?.guestListCloseTime
  );
  const [isTicketsSelected, setIsTicketsSelected] =
    useState(!!initialTicketData);

  const [errors, setErrors] = useState<{
    eventName?: string;
    date?: string;
    maleTicketPrice?: string;
    femaleTicketPrice?: string;
    maleTicketCapacity?: string;
    femaleTicketCapacity?: string;
    startTime?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const priceRegex = /^\d*\.?\d{0,2}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    let hasErrors = false;

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

    const today = startOfDay(new Date());
    if (date) {
      if (isBefore(date, today)) {
        setErrors((prev) => ({
          ...prev,
          date: "Event date cannot be in the past.",
        }));
        hasErrors = true;
      }
    } else {
      setErrors((prev) => ({
        ...prev,
        date: "Event date is required.",
      }));
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
    }

    if (hasErrors || !date) {
      return;
    }
    setIsLoading(true);
    try {
      const eventData = {
        name: eventName,
        description: description.trim() !== "" ? description : null,
        date: format(date, "yyyy-MM-dd"),
        startTime: startTime.trim(),
        endTime: endTime.trim() !== "" ? endTime : null,
        guestListCloseTime:
          isGuestListSelected && guestListCloseTime.trim() !== ""
            ? guestListCloseTime
            : null,
        photo: photo ? photo.name : null,
      };

      const ticketData = isTicketsSelected
        ? {
            maleTicketPrice: parseFloat(maleTicketPrice) || 0,
            femaleTicketPrice: parseFloat(femaleTicketPrice) || 0,
            maleTicketCapacity: parseInt(maleTicketCapacity) || 0,
            femaleTicketCapacity: parseInt(femaleTicketCapacity) || 0,
          }
        : null;

      await onSubmit(eventData, ticketData);
      if (
        isEdit &&
        initialTicketData &&
        !isTicketsSelected &&
        deleteTicketInfo &&
        eventId
      ) {
        await deleteTicketInfo(eventId);
      }
    } catch (error) {
      console.error("Error submitting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
          accept="image/*"
          className="w-full max-w-[500px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Event Date</Label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        {errors.date && <p className="text-red-500">{errors.date}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          type="time"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full max-w-[500px]"
        />
        {errors.startTime && <p className="text-red-500">{errors.startTime}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="endTime">End Time</Label>
        <Input
          type="time"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full max-w-[500px]"
        />
      </div>

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

      {isGuestListSelected && (
        <div className="space-y-2">
          <Label htmlFor="guestListCloseTime">Guest List Close Time</Label>
          <Input
            type="time"
            id="guestListCloseTime"
            value={guestListCloseTime}
            onChange={(e) => setGuestListCloseTime(e.target.value)}
            className="w-full max-w-[500px]"
          />
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
        </>
      )}

      <Button type="submit" disabled={isLoading}>
        {isEdit ? "Update Event" : "Add Event"}
      </Button>
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
