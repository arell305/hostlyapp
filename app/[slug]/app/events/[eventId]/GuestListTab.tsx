import { EventData, GuestListInfo } from "@/types/types";
import React from "react";
import PromoterGuestList from "@/[slug]/app/components/PromoterGuestList";
import EventGuestList from "@/[slug]/app/components/EventGuestList";
import ModeratorGuestList from "@/[slug]/app/components/ModeratorGuestList";
import { LuClipboardList } from "react-icons/lu";
import { EventSchema, GuestListInfoSchema } from "@/types/schemas-types";
import { Permission } from "@/types/enums";
import { isPast } from "../../../../../utils/luxon";

interface GuestListTabProps {
  eventData: EventSchema;
  promoterClerkId: string | null;
  guestListInfo?: GuestListInfoSchema | null;
  has: any;
}

const GuestListTab: React.FC<GuestListTabProps> = ({
  eventData,
  guestListInfo,
  promoterClerkId,
  has,
}) => {
  if (!guestListInfo) {
    return (
      <div className="mb-4 flex flex-col gap-4 bg-gray-100 min-h-[100vh]">
        <div className=" bg-white w-[95%] mx-auto px-4 pt-4 mt-4 rounded-md mb-4 shadow-md">
          <h1 className="text-2xl font-bold pb-3">Ticket Info</h1>
          <div className="flex items-center  space-x-3 py-3 ">
            <LuClipboardList className="text-2xl" />
            <p>There is no guest list option for this event</p>
          </div>
        </div>
      </div>
    );
  }

  const canViewAllGuestList: boolean = has({
    permission: Permission.VIEW_ALL_GUESTLISTS,
  });

  const canCheckInGuests: boolean = has({
    permission: Permission.CHECK_GUESTS,
  });
  const canUploadGuest: boolean = promoterClerkId ? true : false;

  let isGuestListOpen: boolean = !isPast(guestListInfo.guestListCloseTime);

  let isCheckInOpen: boolean = !isPast(guestListInfo.checkInCloseTime);

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
          isCheckInOpen={isCheckInOpen}
          checkInCloseTime={guestListInfo.checkInCloseTime}
        />
      )}
      {canCheckInGuests && (
        <ModeratorGuestList
          eventId={eventData._id}
          isCheckInOpen={isCheckInOpen}
          checkInCloseTime={guestListInfo.checkInCloseTime}
        />
      )}
    </>
  );
};

export default GuestListTab;
