"use client";

import CustomCard from "@/shared/ui/cards/CustomCard";
import EmptyList from "@/shared/ui/list/EmptyList";
import { GuestListEntryWithPromoter } from "@shared/types/schemas-types";
import GuestCard from "./GuestCard";
import { Doc, Id } from "convex/_generated/dataModel";

interface GuestListContainerProps {
  filteredGuests: GuestListEntryWithPromoter[];
  handleCheckInGuest?: (guest: GuestListEntryWithPromoter) => void;
  isCheckInOpen: boolean;
  canCheckInGuests: boolean;
  canSeePhoneNumber: boolean;
  editingId?: Id<"guestListEntries"> | null;
  editName?: string;
  onEdit?: (guest: Doc<"guestListEntries">) => void;
  onShowDelete?: (id: Id<"guestListEntries">) => void;
  onCancelEdit?: () => void;
  setEditName?: (name: string) => void;
  canEditGuests: boolean;
  isGuestListOpen?: boolean;
}
const GuestListContainer: React.FC<GuestListContainerProps> = ({
  filteredGuests,
  handleCheckInGuest,
  isCheckInOpen,
  canCheckInGuests,
  canSeePhoneNumber,
  editingId,
  editName,
  onEdit,
  onShowDelete,
  onCancelEdit,
  setEditName,
  canEditGuests,
  isGuestListOpen,
}: GuestListContainerProps) => {
  if (filteredGuests.length === 0) {
    return <EmptyList items={filteredGuests} />;
  }
  return (
    <CustomCard>
      {filteredGuests.map((guest: GuestListEntryWithPromoter) => (
        <GuestCard
          key={guest._id}
          guest={guest}
          canEditGuests={canEditGuests}
          canSeePromoterName={true}
          canCheckInGuests={canCheckInGuests}
          onCheckIn={handleCheckInGuest}
          isCheckInOpen={isCheckInOpen}
          canSeePhoneNumber={canSeePhoneNumber}
          editingId={editingId}
          editName={editName}
          onEdit={onEdit}
          onShowDelete={onShowDelete}
          onCancelEdit={onCancelEdit}
          setEditName={setEditName}
          isGuestListOpen={isGuestListOpen}
        />
      ))}
    </CustomCard>
  );
};

export default GuestListContainer;
