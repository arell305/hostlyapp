"use client";

import { Doc, Id } from "convex/_generated/dataModel";
import PromoterGuestListContent from "./PromoterGuestListContent";
import ModeratorGuestListContent from "./ModeratorGuestListContent";
import { isPast } from "@/shared/utils/luxon";
import SubPageContainer from "@/shared/ui/containers/SubPageContainer";
import { useEventWithGuestLists } from "@/domain/guestListEntries";

interface GuestListPageProps {
  eventId: Id<"events">;
  canUploadGuest: boolean;
  canCheckInGuests: boolean;
  guestListInfo: Doc<"guestListInfo">;
}

const GuestListPage: React.FC<GuestListPageProps> = ({
  eventId,
  canUploadGuest,
  canCheckInGuests,
  guestListInfo,
}) => {
  let isCheckInOpen: boolean = !isPast(guestListInfo.checkInCloseTime);
  const isGuestListOpen = !isPast(guestListInfo.guestListCloseTime);

  const resultGuestList = useEventWithGuestLists(eventId);

  if (!resultGuestList) {
    return;
  }

  return (
    <SubPageContainer>
      {canUploadGuest ? (
        <PromoterGuestListContent
          guestListData={resultGuestList}
          isGuestListOpen={isGuestListOpen}
        />
      ) : (
        <ModeratorGuestListContent
          isCheckInOpen={isCheckInOpen}
          guestListData={resultGuestList}
          canCheckInGuests={canCheckInGuests}
        />
      )}
    </SubPageContainer>
  );
};

export default GuestListPage;
