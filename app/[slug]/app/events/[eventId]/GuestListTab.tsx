import React from "react";
import { EventSchema, GuestListInfoSchema } from "@/types/schemas-types";
import { isPast } from "../../../../../utils/luxon";
import { GetEventWithGuestListsData } from "@/types/convex-types";
import ModeratorGuestListContent from "../guestList/ModeratorGuestListContent";
import PromoterGuestListContent from "../guestList/PromoterGuestListContent";

interface GuestListTabProps {
  guestListInfo: GuestListInfoSchema;
  guestListData: GetEventWithGuestListsData;
  canUploadGuest: boolean;
  canCheckInGuests: boolean;
}

const GuestListTab: React.FC<GuestListTabProps> = ({
  guestListInfo,
  guestListData,
  canUploadGuest,
  canCheckInGuests,
}) => {
  let isCheckInOpen: boolean = !isPast(guestListInfo.checkInCloseTime);
  return (
    <>
      {canUploadGuest ? (
        <PromoterGuestListContent guestListData={guestListData} />
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
