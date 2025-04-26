import React from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import PromoterGuestListContent from "./PromoterGuestListContent";

type GuestListManagerProps = {
  eventId: Id<"events">;
  isGuestListOpen: boolean;
  guestListCloseTime: number;
};

const PromoterGuestListPage = ({
  eventId,
  isGuestListOpen,
  guestListCloseTime,
}: GuestListManagerProps) => {
  const getGuestListByPromoterResponse = useQuery(
    api.guestLists.getGuestListByPromoter,
    {
      eventId,
    }
  );

  const result = handleQueryState(getGuestListByPromoterResponse);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const guestList = result.data;

  return (
    <PromoterGuestListContent
      eventId={eventId}
      guestList={guestList}
      isGuestListOpen={isGuestListOpen}
      guestListCloseTime={guestListCloseTime}
    />
  );
};

export default PromoterGuestListPage;
