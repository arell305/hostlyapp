"use client";

import { Doc, Id } from "convex/_generated/dataModel";
import SubPageContainer from "@/shared/ui/containers/SubPageContainer";
import { useRef, useState } from "react";
import SearchInput from "../SearchInput";
import GuestListLoader from "./GuestListLoader";

interface GuestListPageProps {
  eventId: Id<"events">;
  canUploadGuest: boolean;
  canCheckInGuests: boolean;
  guestListInfo: Doc<"guestListInfo">;
}

const GuestListPage: React.FC<GuestListPageProps> = ({
  eventId,
  canUploadGuest,
  canCheckInGuests,
  guestListInfo,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  return (
    <SubPageContainer>
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
        placeholder="Search guests..."
        className="mb-4"
      />
      <GuestListLoader
        eventId={eventId}
        searchTerm={searchTerm}
        canUploadGuest={canUploadGuest}
        canCheckInGuests={canCheckInGuests}
        guestListInfo={guestListInfo}
      />
    </SubPageContainer>
  );
};

export default GuestListPage;
