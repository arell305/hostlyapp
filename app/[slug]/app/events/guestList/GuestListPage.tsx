import { QueryState } from "@/types/enums";
import { handleQueryState } from "@/utils/handleQueryState";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import PromoterGuestListContent from "./PromoterGuestListContent";
import ModeratorGuestListContent from "./ModeratorGuestListContent";
import { GuestListInfoSchema } from "@/types/schemas-types";
import { isPast } from "@/utils/luxon";
import SubPageContainer from "@/components/shared/containers/SubPageContainer";
import { useEventWithGuestLists } from "../hooks/useEventWithGuestLists";
import { isError, isLoading, isSuccess } from "@/types/types";

interface GuestListPageProps {
  eventId: Id<"events">;
  canUploadGuest: boolean;
  canCheckInGuests: boolean;
  guestListInfo: GuestListInfoSchema;
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

  if (isLoading(resultGuestList) || isError(resultGuestList)) {
    return resultGuestList.component;
  }

  const guestListData = resultGuestList.data;

  return (
    <SubPageContainer>
      {canUploadGuest ? (
        <PromoterGuestListContent
          guestListData={guestListData}
          isGuestListOpen={isGuestListOpen}
        />
      ) : (
        <ModeratorGuestListContent
          isCheckInOpen={isCheckInOpen}
          guestListData={guestListData}
          canCheckInGuests={canCheckInGuests}
        />
      )}
    </SubPageContainer>
  );
};

export default GuestListPage;
