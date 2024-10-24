import React, { useMemo, useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import GuestCard from "./GuestCard";
import { toast } from "@/hooks/use-toast";
import UpdateGuestModal from "./UpdateGuestModal";

interface EventGuestListProps {
  eventId: Id<"events">;
  isCheckInOpen: boolean;
}

interface Guest {
  id: string;
  name: string;
  promoterId: string;
  guestListId: Id<"guestLists">;
  promoterName: string;
  attended?: boolean;
  malesInGroup?: number;
  femalesInGroup?: number;
}

const ModeratorGuestList = ({
  eventId,
  isCheckInOpen,
}: EventGuestListProps) => {
  const result = useQuery(api.events.getEventWithGuestLists, { eventId });
  const [searchTerm, setSearchTerm] = useState("");
  const updateGuestAttendance = useMutation(api.events.updateGuestAttendance);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const filteredGuests = useMemo(() => {
    if (!result) return [];
    return result.guests.filter((guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [result, searchTerm]);

  const totals = useMemo(() => {
    if (!result?.guests) return { totalMales: 0, totalFemales: 0 };

    const totalMales = result.guests.reduce(
      (sum, guest) => sum + (guest.malesInGroup || 0),
      0
    );
    const totalFemales = result.guests.reduce(
      (sum, guest) => sum + (guest.femalesInGroup || 0),
      0
    );
    return { totalMales, totalFemales };
  }, [result]);

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
  };

  const handleSaveGuestUpdate = async (
    guestId: string,
    maleCount: number,
    femaleCount: number
  ) => {
    if (selectedGuest) {
      try {
        await updateGuestAttendance({
          guestListId: selectedGuest.guestListId,
          guestId,
          attended: true,
          malesInGroup: maleCount,
          femalesInGroup: femaleCount,
        });
        toast({
          title: "Guest checked in successfully",
          description: "The guest's attendance has been recorded.",
        });
        closeModal();
      } catch (error) {
        console.error("Error updating guest attendance:", error);
        toast({
          title: "Error checking in guest",
          description: "There was a problem recording the guest's attendance.",
          variant: "destructive",
        });
      }
    }
  };

  if (!result) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4">
        {!isCheckInOpen && <h2>No Longer able to check in guests</h2>}
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mr-2"
          />
          <FaSearch className="text-gray-400" />
        </div>
        <div>
          <div>Total Males: {totals.totalMales}</div>
          <div>Total Females: {totals.totalFemales}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map((guest: Guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              canEditGuests={false}
              canSeePromoterName={true}
              canCheckInGuests={isCheckInOpen}
              onCheckIn={handleCheckInGuest}
            />
          ))}
        </div>
      </div>
      {selectedGuest && (
        <UpdateGuestModal
          isOpen={isModalOpen}
          onClose={closeModal}
          guest={selectedGuest}
          onSave={handleSaveGuestUpdate}
        />
      )}
    </>
  );
};

export default ModeratorGuestList;
