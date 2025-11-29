"use client";

import { Doc, Id } from "convex/_generated/dataModel";
import { useEventWithGuestLists } from "@/domain/guestListEntries";
import GuestListPage from "./GuestListPage";
import TicketsSkeleton from "@/shared/ui/skeleton/TicketsSkeleton";

interface GuestListLoaderProps {
  eventId: Id<"events">;
  canUploadGuest: boolean;
  canCheckInGuests: boolean;
  guestListInfo: Doc<"guestListInfo">;
}

const GuestListLoader: React.FC<GuestListLoaderProps> = ({
  eventId,
  canUploadGuest,
  canCheckInGuests,
  guestListInfo,
}) => {
  const resultGuestList = useEventWithGuestLists(eventId);

  if (!resultGuestList) {
    return <TicketsSkeleton />;
  }

  return (
    <GuestListPage
      guestListData={resultGuestList}
      canUploadGuest={canUploadGuest}
      canCheckInGuests={canCheckInGuests}
      guestListInfo={guestListInfo}
    />
  );
};

export default GuestListLoader;
