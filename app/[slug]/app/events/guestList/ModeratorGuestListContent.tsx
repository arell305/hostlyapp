"use client";

import React, { useMemo, useRef, useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { GetEventWithGuestListsData } from "@/types/convex-types";
import useMediaQuery from "@/hooks/useMediaQuery";
import { formatToTimeAndShortDate } from "../../../../../utils/luxon";
import { GuestWithPromoter } from "@/types/types";
import { useUpdateGuestAttendance } from "../hooks/useUpdateGuestAttendance";
import {
  filterGuestsByName,
  getTotalFemales,
  getTotalMales,
} from "../../../../../utils/format";
import SearchInput from "../components/SearchInput";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import GuestListContainer from "./GuestListContainer";
import ResponsiveGuestCheckIn from "../../components/responsive/ResponsiveGuestCheckIn";

interface ModeratorGuestListContentProps {
  isCheckInOpen: boolean;
  guestListData: GetEventWithGuestListsData;
  canCheckInGuests: boolean;
}

const ModeratorGuestListContent = ({
  isCheckInOpen,
  guestListData,
  canCheckInGuests,
}: ModeratorGuestListContentProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestWithPromoter | null>(
    null
  );

  const {
    updateGuestAttendance,
    isLoading: isCheckInGuestLoading,
    error: checkInGuestError,
    setError: setIsCheckInGuestError,
  } = useUpdateGuestAttendance();

  const filteredGuests = useMemo(() => {
    return filterGuestsByName(guestListData.guests, searchTerm);
  }, [guestListData, searchTerm]);

  const handleCheckInGuest = (guestId: string) => {
    const guest = filteredGuests.find((g) => g.id === guestId);
    if (guest) {
      setSelectedGuest(guest);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
    setIsCheckInGuestError(null);
  };

  const handleSaveGuestUpdate = async (
    guestId: string,
    maleCount: number,
    femaleCount: number
  ) => {
    if (!selectedGuest || !selectedGuest.guestListId) {
      setIsCheckInGuestError("No guest selected");
      return;
    }

    const success = await updateGuestAttendance(
      selectedGuest.guestListId,
      guestId,
      true,
      maleCount,
      femaleCount
    );

    if (success) {
      closeModal();
    }
  };

  return (
    <>
      <SectionContainer>
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
          isDesktop={isDesktop}
          placeholder="Search guests..."
        />
        <GuestListContainer
          filteredGuests={filteredGuests}
          handleCheckInGuest={handleCheckInGuest}
          isCheckInOpen={isCheckInOpen}
          canCheckInGuests={canCheckInGuests}
          canSeePhoneNumber={!canCheckInGuests}
        />
      </SectionContainer>

      {selectedGuest && (
        <ResponsiveGuestCheckIn
          isOpen={isModalOpen}
          onClose={closeModal}
          guest={selectedGuest}
          onSave={handleSaveGuestUpdate}
          isLoading={isCheckInGuestLoading}
          error={checkInGuestError}
        />
      )}
    </>
  );
};

export default ModeratorGuestListContent;
