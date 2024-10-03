"use client";

import { FC, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, startOfDay } from "date-fns";
import { useOrganization } from "@clerk/nextjs";

const AddEventPage: FC = () => {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") || "";

  const [eventName, setEventName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [guestListUploadTime, setGuestListUploadTime] = useState<string>("");
  const [maleTicketPrice, setMaleTicketPrice] = useState<string>("");
  const [femaleTicketPrice, setFemaleTicketPrice] = useState<string>("");
  const [maleTicketCapacity, setMaleTicketCapacity] = useState<string>("");
  const [femaleTicketCapacity, setFemaleTicketCapacity] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : undefined
  );
  const [errors, setErrors] = useState<{ eventName?: string; date?: string }>(
    {}
  );
  const [guestListSelected, setGuestListSelected] = useState<boolean>(false);
  const [ticketSelected, setTicketSelected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const { organization, isLoaded: orgLoaded } = useOrganization();

  const addEvent = useMutation(api.events.addEvent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) {
      return;
    }

    setErrors({});

    if (eventName.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        eventName: "Name must be filled.",
      }));
      return;
    }

    if (!date) {
      setErrors((prev) => ({ ...prev, date: "Event date is required" }));
    } else {
      const today = startOfDay(new Date());
      if (isBefore(date, today)) {
        setErrors((prev) => ({
          ...prev,
          date: "Event date cannot be in the past",
        }));
        return;
      }
    }

    // Check if optional fields are empty strings and set them to null
    const validStartTime = startTime.trim() !== "" ? startTime : null;
    const validEndTime = endTime.trim() !== "" ? endTime : null;
    const validDescription = description.trim() !== "" ? description : null;
    const validGuestListUploadTime =
      guestListUploadTime.trim() !== "" ? guestListUploadTime : null;
    const validMaleTicketPrice =
      maleTicketPrice.trim() !== "" ? maleTicketPrice : null;
    const validFemaleTicketPrice =
      femaleTicketPrice.trim() !== "" ? femaleTicketPrice : null;
    const validMaleTicketCapacity =
      maleTicketCapacity.trim() !== "" ? maleTicketCapacity : null;
    const validFemaleTicketCapacity =
      femaleTicketCapacity.trim() !== "" ? femaleTicketCapacity : null;

    setIsLoading(true);
    try {
      const eventId = await addEvent({
        clerkOrganizationId: organization.id, // Replace with actual ID
        name: eventName,
        date: date ? format(date, "yyyy-MM-dd") : "",
        description: validDescription,
        startTime: validStartTime,
        endTime: validEndTime,
        guestListUploadTime: guestListSelected
          ? validGuestListUploadTime
          : null,
        maleTicketPrice: ticketSelected ? validMaleTicketPrice : null,
        femaleTicketPrice: ticketSelected ? validFemaleTicketPrice : null,
        maleTicketCapacity: ticketSelected ? validMaleTicketCapacity : null,
        femaleTicketCapacity: ticketSelected ? validFemaleTicketCapacity : null,
        photo: photo ? photo.name : null,
      });

      console.log("Event added successfully with ID:", eventId);
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error("Error adding event:", error);
      // Handle error (e.g., show an error message)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Event</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="eventName">Event Name</Label>
          <Input
            id="eventName"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full max-w-[500px]"
          />
          {errors.eventName && (
            <p className="text-red-500">{errors.eventName}</p>
          )}
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
            onChange={(e) =>
              setPhoto(e.target.files ? e.target.files[0] : null)
            }
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
          <Input
            type="text"
            value={date ? format(date, "MM/dd/yy") : ""}
            onChange={(e) => {
              const inputDate = new Date(e.target.value);
              if (!isNaN(inputDate.getTime())) {
                setDate(inputDate);
              }
            }}
            placeholder="Enter date (MM/DD/YY)"
            className="w-full max-w-[500px] mt-2"
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time (optional)</Label>
          <Input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full max-w-[500px]"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Event Type</h2>
          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={() => setGuestListSelected(!guestListSelected)}
              variant={guestListSelected ? "default" : "outline"}
            >
              {guestListSelected ? "Remove Guest List" : "Add Guest List"}
            </Button>
            <Button
              type="button"
              onClick={() => setTicketSelected(!ticketSelected)}
              variant={ticketSelected ? "default" : "outline"}
            >
              {ticketSelected ? "Remove Ticket" : "Add Ticket"}
            </Button>
          </div>
        </div>
        {guestListSelected && (
          <div className="space-y-2">
            <Label htmlFor="guestListUploadTime">Guest List Upload Time</Label>
            <Input
              type="time"
              id="guestListUploadTime"
              value={guestListUploadTime}
              onChange={(e) => setGuestListUploadTime(e.target.value)}
              className="w-full max-w-[500px]"
            />
          </div>
        )}
        {ticketSelected && (
          <>
            <div className="space-y-2">
              <Label htmlFor="maleTicketPrice">Male Ticket Price</Label>
              <Input
                type="number"
                id="maleTicketPrice"
                value={maleTicketPrice}
                onChange={(e) => setMaleTicketPrice(e.target.value)}
                className="w-full max-w-[500px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="femaleTicketPrice">Female Ticket Price</Label>
              <Input
                type="number"
                id="femaleTicketPrice"
                value={femaleTicketPrice}
                onChange={(e) => setFemaleTicketPrice(e.target.value)}
                className="w-full max-w-[500px]"
              />
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="femaleTicketCapacity">
                Female Ticket Capacity
              </Label>
              <Input
                type="number"
                id="femaleTicketCapacity"
                value={femaleTicketCapacity}
                onChange={(e) => setFemaleTicketCapacity(e.target.value)}
                className="w-full max-w-[500px]"
                min="0"
              />
            </div>
          </>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding Event..." : "Add Event"}
        </Button>{" "}
      </form>
    </div>
  );
};

export default AddEventPage;
