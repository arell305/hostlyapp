"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-react";
import Link from "next/link";
import { ClerkRoleEnum } from "@/utils/enums";
import { FaPencilAlt, FaSave, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import EventForm from "@/dashboard/components/EventForm";

type EventProps = {
  eventId: Id<"events">;
};

export default function EventPage({ eventId }: EventProps) {
  const eventData = useQuery(api.events.getEventById, { eventId });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingEvent, setIsEditingEvent] = useState(false);

  const { orgRole, userId: promoterId, isLoaded } = useAuth();

  const canUploadGuestList = orgRole === ClerkRoleEnum.ORG_PROMOTER;
  const canViewAllGuestList =
    orgRole === ClerkRoleEnum.ORG_ADMIN ||
    orgRole === ClerkRoleEnum.ORG_MODERATOR ||
    orgRole === ClerkRoleEnum.ORG_MANAGER;
  const canEdit =
    orgRole === ClerkRoleEnum.ORG_ADMIN ||
    orgRole === ClerkRoleEnum.ORG_MANAGER;

  const promoCodeUsage = useQuery(
    api.promoCodeUsage.getPromoCodeUsageByPromoterAndEvent,
    canUploadGuestList && promoterId && eventData?.ticketInfo
      ? { clerkPromoterUserId: promoterId, eventId }
      : "skip"
  );

  const updateEvent = useMutation(api.events.updateEvent);
  const updateTicketInfo = useMutation(api.ticketInfo.updateTicketInfo);
  const insertTicketInfo = useMutation(api.ticketInfo.insertTicketInfo);
  const deleteTicketInfoAndUpdateEvent = useMutation(
    api.ticketInfo.deleteTicketInfoAndUpdateEvent
  );

  useEffect(() => {
    if (
      eventData !== undefined &&
      (promoCodeUsage !== undefined ||
        !canUploadGuestList ||
        !eventData.ticketInfo)
    ) {
      setIsLoading(false);
    }
  }, [eventData, promoCodeUsage, canUploadGuestList]);

  if (isLoading || !isLoaded) {
    return <div>Loading...</div>;
  }

  if (!eventData) {
    return <div>Event not found</div>;
  }

  const { ticketInfo, ...event } = eventData;

  const handleSubmit = async (eventData: any, ticketData: any) => {
    try {
      await updateEvent({
        id: eventId,
        ...eventData,
      });

      if (ticketData) {
        if (ticketInfo) {
          // Update existing ticket info
          await updateTicketInfo({
            eventId,
            ...ticketData,
          });
        } else {
          // Insert new ticket info if it doesn't exist
          await insertTicketInfo({
            eventId,
            ...ticketData,
          });
        }
      }

      setIsEditingEvent(false);
      // Optionally, you can refetch the event data here to update the UI
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteTicketInfo = async (eventId: Id<"events">) => {
    try {
      await deleteTicketInfoAndUpdateEvent({ eventId });
      // Handle successful deletion (e.g., update UI, show success message)
    } catch (error) {
      console.error("Error deleting ticket info:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {isEditingEvent ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">Edit Event</h1>
          <EventForm
            initialEventData={event}
            initialTicketData={ticketInfo}
            onSubmit={handleSubmit}
            isEdit={true}
            canAddGuestList={canUploadGuestList}
            deleteTicketInfo={handleDeleteTicketInfo} // Pass the deleteTicketInfo function
            eventId={eventId}
          />
          <Button onClick={() => setIsEditingEvent(false)} className="mt-4">
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{event.name}</h1>
            {canEdit && (
              <Button onClick={() => setIsEditingEvent(true)}>
                <FaPencilAlt className="mr-2" /> Edit Event
              </Button>
            )}
          </div>
          <p className="text-gray-600 mb-2">Date: {event.date}</p>
          <p className="text-gray-600 mb-2">Start Time: {event.startTime}</p>

          {event.endTime && (
            <p className="text-gray-600 mb-2">End Time: {event.endTime}</p>
          )}
          {event.description && (
            <p className="text-gray-800 mb-4">{event.description}</p>
          )}
          {event.photo && (
            <img
              src={event.photo}
              alt={event.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}
          {ticketInfo && (
            <>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h2 className="text-xl font-semibold mb-2">
                  Ticket Information
                </h2>
                <p className="mb-1">
                  Male Ticket Price: ${ticketInfo.maleTicketPrice.toFixed(2)}
                </p>
                <p className="mb-1">
                  Female Ticket Price: $
                  {ticketInfo.femaleTicketPrice.toFixed(2)}
                </p>
                <p className="mb-1">
                  Male Ticket Capacity: {ticketInfo.maleTicketCapacity}
                </p>
                <p>Female Ticket Capacity: {ticketInfo.femaleTicketCapacity}</p>
              </div>
              {canEdit && (
                <div className="bg-green-100 p-4 rounded-lg mb-4">
                  <h2 className="text-xl font-semibold mb-2">Tickets Sold</h2>
                  <p className="mb-1">
                    Male Tickets Sold: {ticketInfo.totalMaleTicketsSold}
                  </p>
                  <p>
                    Female Tickets Sold: {ticketInfo.totalFemaleTicketsSold}
                  </p>
                </div>
              )}
            </>
          )}
          {canUploadGuestList && ticketInfo && promoCodeUsage && (
            <div className="bg-blue-100 p-4 rounded-lg mb-4">
              <h2 className="text-xl font-semibold mb-2">
                Your Promo Code Usage
              </h2>
              <p className="mb-1">
                Male Tickets: {promoCodeUsage.maleUsageCount}
              </p>
              <p className="mb-1">
                Female Tickets: {promoCodeUsage.femaleUsageCount}
              </p>
            </div>
          )}
          {canUploadGuestList && ticketInfo && (
            <Link href={`/events/${eventId}/promoters/${promoterId}`}>
              <Button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
                Manage Guest List
              </Button>
            </Link>
          )}
          {canViewAllGuestList && (
            <Link href={`/events/${eventId}/guestlist`}>
              <Button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                View Guest List
              </Button>
            </Link>
          )}
        </>
      )}
    </div>
  );
}
