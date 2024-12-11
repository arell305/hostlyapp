import React, { useMemo, useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import GuestCard from "./GuestCard";
import { toast } from "@/hooks/use-toast";
import UpdateGuestModal from "./UpdateGuestModal";
import DetailsSkeleton from "./loading/DetailsSkeleton";
import { GetEventWithGuestListsResponse, GuestWithPromoter } from "@/types";

interface EventGuestListProps {
  eventId: Id<"events">;
  isCheckInOpen: boolean;
}

const ModeratorGuestList = ({
  eventId,
  isCheckInOpen,
}: EventGuestListProps) => {
  const getEventWithGuestListsResponse = useQuery(
    api.events.getEventWithGuestLists,
    { eventId }
  );

  const [searchTerm, setSearchTerm] = useState<string>("");
  const updateGuestAttendance = useMutation(api.events.updateGuestAttendance);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestWithPromoter | null>(
    null
  );
  const filteredGuests = useMemo(() => {
    if (!getEventWithGuestListsResponse || !getEventWithGuestListsResponse.data)
      return [];
    return getEventWithGuestListsResponse.data.guests.filter((guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [getEventWithGuestListsResponse, searchTerm]);

  const totals = useMemo(() => {
    if (!getEventWithGuestListsResponse?.data?.guests)
      return { totalMales: 0, totalFemales: 0 };

    const totalMales: number =
      getEventWithGuestListsResponse?.data?.guests.reduce(
        (sum, guest) => sum + (guest.malesInGroup || 0),
        0
      );
    const totalFemales: number =
      getEventWithGuestListsResponse?.data?.guests.reduce(
        (sum, guest) => sum + (guest.femalesInGroup || 0),
        0
      );
    return { totalMales, totalFemales };
  }, [getEventWithGuestListsResponse?.data]);

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
    if (selectedGuest && selectedGuest.guestListId) {
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

  if (getEventWithGuestListsResponse === undefined) {
    return <DetailsSkeleton />;
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
        <div className="">
          {filteredGuests.map((guest: GuestWithPromoter) => (
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
