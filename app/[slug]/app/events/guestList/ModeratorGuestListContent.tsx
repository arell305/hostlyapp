"use client";

import React, { useMemo, useRef, useState } from "react";
import { useUpdateGuestAttendance } from "../hooks/useUpdateGuestAttendance";
import { filterGuestsByName } from "../../../../../utils/format";
import SearchInput from "../components/SearchInput";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import GuestListContainer from "./GuestListContainer";
import ResponsiveGuestCheckIn from "../../components/responsive/ResponsiveGuestCheckIn";
import { GuestListEntryWithPromoter } from "@/types/schemas-types";
import { Id } from "convex/_generated/dataModel";

interface ModeratorGuestListContentProps {
  isCheckInOpen: boolean;
  guestListData: GuestListEntryWithPromoter[];
  canCheckInGuests: boolean;
}

const ModeratorGuestListContent = ({
  isCheckInOpen,
  guestListData,
  canCheckInGuests,
}: ModeratorGuestListContentProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedGuest, setSelectedGuest] =
    useState<GuestListEntryWithPromoter | null>(null);
  const {
    updateGuestAttendance,
    isLoading: isCheckInGuestLoading,
    error: checkInGuestError,
    setError: setIsCheckInGuestError,
  } = useUpdateGuestAttendance();

  const filteredGuests = useMemo(() => {
    return filterGuestsByName(guestListData, searchTerm);
  }, [guestListData, searchTerm]);

  const handleCheckInGuest = (guest: GuestListEntryWithPromoter) => {
    setSelectedGuest(guest);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
    setIsCheckInGuestError(null);
  };

  const handleSaveGuestUpdate = async (
    guestId: Id<"guestListEntries">,
    maleCount: number,
    femaleCount: number
  ) => {
    if (!selectedGuest) {
      setIsCheckInGuestError("No guest selected");
      return;
    }

    const success = await updateGuestAttendance(
      guestId,
      maleCount,
      femaleCount,
      true
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
          placeholder="Search guests..."
        />
        <GuestListContainer
          filteredGuests={filteredGuests}
          handleCheckInGuest={handleCheckInGuest}
          isCheckInOpen={isCheckInOpen}
          canCheckInGuests={canCheckInGuests}
          canSeePhoneNumber={!canCheckInGuests}
          canEditGuests={false}
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
