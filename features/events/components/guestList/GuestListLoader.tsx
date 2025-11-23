"use client";

import { Doc, Id } from "convex/_generated/dataModel";
import PromoterGuestListContent from "./PromoterGuestListContent";
import ModeratorGuestListContent from "./ModeratorGuestListContent";
import { isPast } from "@/shared/utils/luxon";
import { useEventWithGuestLists } from "@/domain/guestListEntries";

interface GuestListLoaderProps {
  eventId: Id<"events">;
  canUploadGuest: boolean;
  canCheckInGuests: boolean;
  guestListInfo: Doc<"guestListInfo">;
  searchTerm: string;
}

const GuestListLoader: React.FC<GuestListLoaderProps> = ({
  eventId,
  canUploadGuest,
  canCheckInGuests,
  guestListInfo,
  searchTerm,
}) => {
  let isCheckInOpen: boolean = !isPast(guestListInfo.checkInCloseTime);
  const isGuestListOpen = !isPast(guestListInfo.guestListCloseTime);

  const resultGuestList = useEventWithGuestLists(eventId);

  if (!resultGuestList) {
    return;
  }

  return (
    <>
      {canUploadGuest ? (
        <PromoterGuestListContent
          guestListData={resultGuestList}
          isGuestListOpen={isGuestListOpen}
          searchTerm={searchTerm}
        />
      ) : (
        <ModeratorGuestListContent
          isCheckInOpen={isCheckInOpen}
          guestListData={resultGuestList}
          canCheckInGuests={canCheckInGuests}
          searchTerm={searchTerm}
        />
      )}
    </>
  );
};

export default GuestListLoader;
