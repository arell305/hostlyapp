"use client";

import { Doc, Id } from "convex/_generated/dataModel";
import PromoterGuestListContent from "./PromoterGuestListContent";
import ModeratorGuestListContent from "./ModeratorGuestListContent";
import { isPast } from "@/shared/utils/luxon";
import { useEventWithGuestLists } from "@/domain/guestListEntries";
import GuestListSkeleton from "@/shared/ui/skeleton/GuestCardSkeleton";
import GuestListPage from "./GuestListPage";

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
    return <GuestListSkeleton />;
  }

  return (
    <GuestListPage
      guestListData={resultGuestList}
      eventId={eventId}
      canUploadGuest={canUploadGuest}
      canCheckInGuests={canCheckInGuests}
      guestListInfo={guestListInfo}
    />
  );
};

export default GuestListLoader;
