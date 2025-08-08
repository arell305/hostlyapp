import React from "react";
import EventGuestListForm from "./EventGuestListForm";
import { useEventContext } from "@/contexts/EventContext";
import DetailsView from "@/[slug]/app/components/view/DetailsView";
import About from "@/[slug]/app/components/view/About";
import GuestListRulesCard from "./GuestListRulesCard";

interface EventGuestListContentProps {
  onBrowseMore: () => void;
}

const EventGuestListContent = ({
  onBrowseMore,
}: EventGuestListContentProps) => {
  const { guestListInfo, event } = useEventContext();
  const { ticketTypes, ...eventData } = event;
  const isGuestListClosed =
    guestListInfo && Date.now() > guestListInfo.guestListCloseTime;

  return (
    <div className="flex flex-col gap-4">
      <DetailsView eventData={eventData} className="w-full" />
      <About description={eventData.description} className="w-full" />
      {guestListInfo && !isGuestListClosed ? (
        <>
          <GuestListRulesCard
            rules={guestListInfo.guestListRules}
            className="w-full"
          />
          <EventGuestListForm
            onBrowseMore={onBrowseMore}
            guestListInfo={guestListInfo}
          />
        </>
      ) : (
        <p>No guest list info</p>
      )}
    </div>
  );
};

export default EventGuestListContent;
