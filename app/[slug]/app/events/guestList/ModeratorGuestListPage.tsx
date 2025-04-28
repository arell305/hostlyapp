import React from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import ModeratorGuestListContent from "./ModeratorGuestListContent";
import { GetEventWithGuestListsData } from "@/types/convex-types";

interface ModeratorGuestListPageProps {
  eventId: Id<"events">;
  isCheckInOpen: boolean;
  checkInCloseTime: number;
  guestListData: GetEventWithGuestListsData;
}

const ModeratorGuestListPage = ({
  eventId,
  isCheckInOpen,
  checkInCloseTime,
  guestListData,
}: ModeratorGuestListPageProps) => {
  const getEventWithGuestListsResponse = useQuery(
    api.events.getEventWithGuestLists,
    { eventId }
  );

  const result = handleQueryState(getEventWithGuestListsResponse);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const guestList = result.data;

  return (
    <ModeratorGuestListContent
      eventId={eventId}
      isCheckInOpen={isCheckInOpen}
      checkInCloseTime={checkInCloseTime}
      guestList={guestList}
    />
  );
};

export default ModeratorGuestListPage;
