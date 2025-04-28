import React from "react";
import { EventSchema, GuestListInfoSchema } from "@/types/schemas-types";
import { isPast } from "../../../../../utils/luxon";
import { GetEventWithGuestListsData } from "@/types/convex-types";
import ModeratorGuestListContent from "../guestList/ModeratorGuestListContent";
import PromoterGuestListContent from "../guestList/PromoterGuestListContent";

interface GuestListTabProps {
  eventData: EventSchema;
  guestListInfo: GuestListInfoSchema;
  guestListData: GetEventWithGuestListsData;
  canUploadGuest: boolean;
  canCheckInGuests: boolean;
}

const GuestListTab: React.FC<GuestListTabProps> = ({
  eventData,
  guestListInfo,
  guestListData,
  canUploadGuest,
  canCheckInGuests,
}) => {
  let isGuestListOpen: boolean = !isPast(guestListInfo.guestListCloseTime);

  let isCheckInOpen: boolean = !isPast(guestListInfo.checkInCloseTime);
  return (
    <>
      {canUploadGuest ? (
        <PromoterGuestListContent
          eventId={eventData._id}
          isGuestListOpen={isGuestListOpen}
          guestListCloseTime={guestListInfo.guestListCloseTime}
          guestListData={guestListData}
        />
      ) : (
        <ModeratorGuestListContent
          isCheckInOpen={isCheckInOpen}
          guestListData={guestListData}
          canCheckInGuests={canCheckInGuests}
        />
      )}
    </>
  );
};

export default GuestListTab;
