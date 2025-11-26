"use client";

import { useMemo, useState } from "react";
import { useUpdateGuestAttendance } from "@/domain/guestListEntries";
import { filterGuestsByName } from "@shared/utils/format";
import SectionContainer from "@shared/ui/containers/SectionContainer";
import GuestListContainer from "./GuestListContainer";
import ResponsiveGuestCheckIn from "@shared/ui/responsive/ResponsiveGuestCheckIn";
import { GuestListEntryWithPromoter } from "@shared/types/schemas-types";
import { Id } from "convex/_generated/dataModel";

interface ModeratorGuestListContentProps {
  isCheckInOpen: boolean;
  filteredGuests: GuestListEntryWithPromoter[];
  canCheckInGuests: boolean;
}

const ModeratorGuestListContent = ({
  isCheckInOpen,
  filteredGuests,
  canCheckInGuests,
}: ModeratorGuestListContentProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedGuest, setSelectedGuest] =
    useState<GuestListEntryWithPromoter | null>(null);
  const {
    updateGuestAttendance,
    isLoading: isCheckInGuestLoading,
    error: checkInGuestError,
    setError: setIsCheckInGuestError,
  } = useUpdateGuestAttendance();

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
