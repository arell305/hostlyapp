import React, { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import {
  FaPencilAlt,
  FaTrashAlt,
  FaCheck,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddGuestListModal from "./AddGuestList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatArrivalTime } from "../../../utils/helpers";
import GuestCard from "./GuestCard";

type GuestListManagerProps = {
  eventId: Id<"events">;
  promoterId: string;
  isGuestListOpen: boolean;
};

interface Guest {
  id: string;
  name: string;
  attended?: boolean;
  malesInGroup?: number;
  femalesInGroup?: number;
  checkInTime?: string;
}

const GuestListPage = ({
  eventId,
  promoterId,
  isGuestListOpen,
}: GuestListManagerProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
  const canAddGuests = true;
  const canEditGuests = true;

  const result = useQuery(api.guestLists.getGuestListByPromoter, {
    clerkPromoterId: promoterId,
    eventId,
  });
  const updateGuestName = useMutation(api.guestLists.updateGuestName);
  const deleteGuestName = useMutation(api.guestLists.deleteGuestName);
  const { toast } = useToast();

  if (result === undefined) {
    return <div>Loading...</div>;
  }
  const isEmptyGuestList = result.guestListId === null;

  const totalMales = result.names.reduce(
    (sum: number, guest: Guest) => sum + (guest.malesInGroup || 0),
    0
  );
  const totalFemales = result.names.reduce(
    (sum: number, guest: Guest) => sum + (guest.femalesInGroup || 0),
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
        guestListId: result.guestListId!,
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
        guestListId: result.guestListId!,
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
      <h1 className="text-2xl font-bold mb-2">Guest List</h1>
      {canAddGuests &&
        (isGuestListOpen ? (
          <>
            <Button
              className="mb-2"
              onClick={() => setIsGuestListModalOpen(true)}
            >
              Add to Guest List
            </Button>
            <AddGuestListModal
              isOpen={isGuestListModalOpen}
              onClose={() => setIsGuestListModalOpen(false)}
              promoterId={promoterId}
              eventId={eventId}
            />
          </>
        ) : (
          <p className="text-red-500 mb-2">Guest List is closed</p>
        ))}
      <div className="mb-2">
        <Badge variant="secondary" className="mr-2">
          Males: {totalMales}
        </Badge>
        <Badge variant="secondary">Females: {totalFemales}</Badge>
      </div>
      {isEmptyGuestList ? (
        <p>No guest list added</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.names.map((guest: Guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              editingId={editingId}
              editName={editName}
              canEditGuests={canEditGuests}
              onEdit={handleEdit}
              onSave={handleSave}
              onDelete={handleDelete}
              onCancelEdit={() => setEditingId(null)}
              setEditName={setEditName}
              canCheckInGuests={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestListPage;
