import React from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import ModeratorGuestListContent from "./ModeratorGuestListContent";

interface ModeratorGuestListPageProps {
  eventId: Id<"events">;
  isCheckInOpen: boolean;
  checkInCloseTime: number;
}

const ModeratorGuestListPage = ({
  eventId,
  isCheckInOpen,
  checkInCloseTime,
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
