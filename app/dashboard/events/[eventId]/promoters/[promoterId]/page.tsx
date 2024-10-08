// pages/events/[eventId]/promoters/[promoterId]/guest-list.tsx
"use client";

import { useParams } from "next/navigation";
import GuestListPage from "./GuestListPage";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function GuestListPageWrapper() {
  const params = useParams();
  const eventId = params.eventId;
  const promoterId = params.promoterId;

  if (
    !eventId ||
    typeof eventId !== "string" ||
    !promoterId ||
    typeof promoterId !== "string"
  ) {
    return <div>Invalid event ID or promoter ID</div>;
  }

  return (
    <GuestListPage
      eventId={eventId as Id<"events">}
      promoterId={promoterId as Id<"users">}
    />
  );
}
