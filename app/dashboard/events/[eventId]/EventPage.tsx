"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/clerk-react";
import Link from "next/link";
import { ClerkRoleEnum } from "@/utils/enums";

type EventProps = {
  eventId: Id<"events">;
};

export default function EventPage({ eventId }: EventProps) {
  const event = useQuery(api.events.getEventById, { eventId });
  const [isLoading, setIsLoading] = useState(true);

  const { orgRole, userId: promoterId, isLoaded } = useAuth();

  const canUploadGuestList = orgRole === ClerkRoleEnum.ORG_PROMOTER;
  const canViewAllGuestList =
    orgRole === ClerkRoleEnum.ORG_ADMIN ||
    orgRole === ClerkRoleEnum.ORG_MODERATOR ||
    orgRole === ClerkRoleEnum.ORG_MANAGER;
  useEffect(() => {
    if (event !== undefined) {
      setIsLoading(false);
    }
  }, [event]);

  if (isLoading || !isLoaded) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
      <p className="text-gray-600 mb-2">Date: {event.date}</p>
      {event.startTime && event.endTime && (
        <p className="text-gray-600 mb-2">
          Time: {event.startTime} - {event.endTime}
        </p>
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
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Ticket Information</h2>
        <p className="mb-1">
          Male Ticket Price: {event.maleTicketPrice || "N/A"}
        </p>
        <p className="mb-1">
          Female Ticket Price: {event.femaleTicketPrice || "N/A"}
        </p>
        <p className="mb-1">
          Male Ticket Capacity: {event.maleTicketCapacity || "N/A"}
        </p>
        <p>Female Ticket Capacity: {event.femaleTicketCapacity || "N/A"}</p>
      </div>
      {canUploadGuestList && (
        <Link href={`/events/${eventId}/promoters/${promoterId}`}>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Manage Guest List
          </button>
        </Link>
      )}
      {canViewAllGuestList && (
        <Link href={`/events/${eventId}/guestlist`}>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            View Guest List
          </button>
        </Link>
      )}
    </div>
  );
}
