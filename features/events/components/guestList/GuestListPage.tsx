"use client";

import { Doc, Id } from "convex/_generated/dataModel";
import SubPageContainer from "@/shared/ui/containers/SubPageContainer";
import { useMemo, useRef, useState } from "react";
import SearchInput from "../SearchInput";
import { GuestListEntryWithPromoter } from "@/shared/types/schemas-types";
import { SEARCH_MIN_LENGTH } from "@/shared/types/constants";
import PromoterGuestListContent from "./PromoterGuestListContent";
import { isPast } from "@/shared/utils/luxon";
import { filterGuestsByName } from "@/shared/utils/format";
import ModeratorGuestListContent from "./ModeratorGuestListContent";

interface GuestListPageProps {
  canUploadGuest: boolean;
  canCheckInGuests: boolean;
  guestListInfo: Doc<"guestListInfo">;
  guestListData: GuestListEntryWithPromoter[];
}

const GuestListPage: React.FC<GuestListPageProps> = ({
  canUploadGuest,
  canCheckInGuests,
  guestListInfo,
  guestListData,
}) => {
  let isCheckInOpen: boolean = !isPast(guestListInfo.checkInCloseTime);
  const isGuestListOpen = !isPast(guestListInfo.guestListCloseTime);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const showSearch = guestListData.length > SEARCH_MIN_LENGTH;

  const filteredGuests = useMemo(() => {
    return filterGuestsByName(guestListData, searchTerm);
  }, [guestListData, searchTerm]);

  return (
    <SubPageContainer>
      {showSearch && (
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
          placeholder="Search guests..."
          className="mb-4"
        />
      )}
      {canUploadGuest ? (
        <PromoterGuestListContent
          filteredGuests={filteredGuests}
          isGuestListOpen={isGuestListOpen}
          searchTerm={searchTerm}
        />
      ) : (
        <ModeratorGuestListContent
          isCheckInOpen={isCheckInOpen}
          filteredGuests={filteredGuests}
          canCheckInGuests={canCheckInGuests}
        />
      )}
    </SubPageContainer>
  );
};

export default GuestListPage;
