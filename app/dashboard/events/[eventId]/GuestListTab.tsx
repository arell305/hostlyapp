import { EventData, GuestListInfo } from "@/types";
import React from "react";
import PromoterGuestList from "@/dashboard/components/PromoterGuestList";
import EventGuestList from "@/dashboard/components/EventGuestList";
import ModeratorGuestList from "@/dashboard/components/ModeratorGuestList";

interface GuestListTabProps {
  eventData: EventData;
  promoterClerkId: string | null;
  guestListInfo?: GuestListInfo | null;
  has: any;
}

const GuestListTab: React.FC<GuestListTabProps> = ({
  eventData,
  guestListInfo,
  promoterClerkId,
  has,
}) => {
  if (!guestListInfo) {
    return <p>There is no guest list option for this event.</p>;
  }

  const canViewAllGuestList: boolean = has({
    permission: "org:events:view_all_guestlists",
  });

  const canCheckInGuests: boolean = has({
    permission: "org:events:check_guests",
  });
  const canUploadGuest: boolean = promoterClerkId ? true : false;

  const now: Date = new Date();
  let isGuestListOpen: boolean = false;

  if (guestListInfo?.guestListCloseTime) {
    const guestListCloseDate = new Date(guestListInfo.guestListCloseTime);

    isGuestListOpen = now < guestListCloseDate;
  }
  let isCheckInOpen = now < new Date(eventData.endTime);

  return (
    <>
      {canUploadGuest && (
        <PromoterGuestList
          eventId={eventData._id}
          promoterId={promoterClerkId}
          isGuestListOpen={isGuestListOpen}
          guestListCloseTime={guestListInfo.guestListCloseTime}
        />
      )}
      {canViewAllGuestList && (
        <EventGuestList
          eventId={eventData._id}
          endTime={eventData.endTime}
          guestListCloseTime={guestListInfo.guestListCloseTime}
        />
      )}
      {canCheckInGuests && (
        <ModeratorGuestList
          eventId={eventData._id}
          isCheckInOpen={isCheckInOpen}
        />
      )}
    </>
  );
};

export default GuestListTab;
