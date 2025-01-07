import React, { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import AddGuestListModal from "./AddGuestList";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import GuestCard from "./GuestCard";
import DetailsSkeleton from "./loading/DetailsSkeleton";
import { GuestListNameSchema } from "@/types/types";
import { DateTime } from "luxon";
import { FiClock } from "react-icons/fi";
import { TbCircleLetterF, TbCircleLetterM } from "react-icons/tb";
import { PiPlusCircle } from "react-icons/pi";

type GuestListManagerProps = {
  eventId: Id<"events">;
  promoterId: string | null;
  isGuestListOpen: boolean;
  guestListCloseTime: string;
};

const PromoterGuestListPage = ({
  eventId,
  promoterId,
  isGuestListOpen,
  guestListCloseTime,
}: GuestListManagerProps) => {
  if (!promoterId) {
    return <p>Error in promoterId</p>;
  }
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
  const formattedGuestListCloseTime = DateTime.fromISO(
    guestListCloseTime
  ).toFormat("MMMM dd, yyyy hh:mm a");
  const getGuestListByPromoterResponse = useQuery(
    api.guestLists.getGuestListByPromoter,
    {
      clerkPromoterId: promoterId,
      eventId,
    }
  );
  const updateGuestName = useMutation(api.guestLists.updateGuestName);
  const deleteGuestName = useMutation(api.guestLists.deleteGuestName);
  const { toast } = useToast();

  if (getGuestListByPromoterResponse === undefined) {
    return <DetailsSkeleton />;
  }

  const isEmptyGuestList =
    getGuestListByPromoterResponse.data?.guestListId === null;

  const totalMales = getGuestListByPromoterResponse.data?.names.reduce(
    (sum: number, guest: GuestListNameSchema) =>
      sum + (guest.malesInGroup || 0),
    0
  );
  const totalFemales = getGuestListByPromoterResponse.data?.names.reduce(
    (sum: number, guest: GuestListNameSchema) =>
      sum + (guest.femalesInGroup || 0),
    0
  );

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSave = async (id: string) => {
    if (editName.trim() === "") {
      toast({
        title: "Invalid Name",
        description: "Name can't be empty",
        variant: "destructive",
      });
      return;
    }
    try {
      await updateGuestName({
        guestListId: getGuestListByPromoterResponse.data?.guestListId!,
        guestId: id,
        newName: editName,
      });
      setEditingId(null);
      toast({
        title: "Name updated",
        description: "Name has been successfully updated",
      });
    } catch (error) {
      console.error("Error updating guest name:", error);
      toast({
        title: "Error",
        description: "Failed to update name. Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGuestName({
        guestListId: getGuestListByPromoterResponse.data?.guestListId!,
        guestId: id,
      });
      toast({
        title: "Name Deleted",
        description: "Name has been successfully delted",
      });
    } catch (error) {
      console.error("Error deleting guest:", error);
      toast({
        title: "Error",
        description: "Failed to delte guest. Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-2">Guest List</h1>

        {isGuestListOpen ? (
          <>
            <PiPlusCircle
              className="text-3xl cursor-pointer"
              onClick={() => setIsGuestListModalOpen(true)}
            />

            <AddGuestListModal
              isOpen={isGuestListModalOpen}
              onClose={() => setIsGuestListModalOpen(false)}
              promoterId={promoterId}
              eventId={eventId}
            />
          </>
        ) : (
          <p className="text-red-500 mb-2">Guest List is closed</p>
        )}
      </div>
      <div className="mb-2 pb-2 border-b border-altGray">
        <div className="flex items-center space-x-1">
          <FiClock />
          <p>Guest List Closes: {formattedGuestListCloseTime}</p>
        </div>
        <div className="flex items-center space-x-1">
          <TbCircleLetterM />
          <p>Males Attended: {totalMales}</p>
        </div>
        <div className="flex items-center space-x-1">
          <TbCircleLetterF />
          <p>Females Attended: {totalFemales}</p>
        </div>
      </div>
      {isEmptyGuestList ? (
        <p>No guest list added</p>
      ) : (
        <div className="">
          {getGuestListByPromoterResponse.data?.names.map(
            (guest: GuestListNameSchema) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                editingId={editingId}
                editName={editName}
                canEditGuests={isGuestListOpen}
                onEdit={handleEdit}
                onSave={handleSave}
                onDelete={handleDelete}
                onCancelEdit={() => setEditingId(null)}
                setEditName={setEditName}
                canCheckInGuests={false}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default PromoterGuestListPage;
