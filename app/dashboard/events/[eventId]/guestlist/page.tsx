"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Id } from "../../../../../convex/_generated/dataModel";
import { FaCheck, FaEdit, FaPlus, FaMinus, FaSearch } from "react-icons/fa";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRoleEnum } from "@/utils/enums";
import { useToast } from "@/hooks/use-toast";

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

interface GuestListPageProps {
  params: { eventId: string };
}

const GuestListPage: React.FC<GuestListPageProps> = ({ params }) => {
  const eventId = params.eventId as Id<"events">;
  const result = useQuery(api.events.getEventWithGuestLists, { eventId });
  const updateGuestAttendance = useMutation(api.events.updateGuestAttendance);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPromoter, setSelectedPromoter] = useState<string>("all");
  const { role, isLoading } = useUserRole();
  const { toast } = useToast();

  const canCheckGuests = role === UserRoleEnum.MODERATOR;

  const promoters = useMemo(() => {
    if (!result) return [];
    return Array.from(
      new Set(result.guests.map((guest) => guest.promoterName))
    );
  }, [result]);

  const filteredGuests = useMemo(() => {
    if (!result) return [];
    return result.guests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedPromoter === "all" || guest.promoterName === selectedPromoter)
    );
  }, [result, searchTerm, selectedPromoter]);

  const promoterTotals = useMemo(() => {
    if (selectedPromoter === "all") return null;
    const promoterGuests = filteredGuests.filter(
      (guest) => guest.promoterName === selectedPromoter
    );
    const totalMales = promoterGuests.reduce(
      (sum, guest) => sum + (guest.malesInGroup || 0),
      0
    );
    const totalFemales = promoterGuests.reduce(
      (sum, guest) => sum + (guest.femalesInGroup || 0),
      0
    );
    return { promoterName: selectedPromoter, totalMales, totalFemales };
  }, [filteredGuests, selectedPromoter]);

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setMaleCount(guest.malesInGroup || 0);
    setFemaleCount(guest.femalesInGroup || 0);
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (editingGuest) {
      try {
        await updateGuestAttendance({
          guestListId: editingGuest.guestListId,
          guestId: editingGuest.id,
          attended: true,
          malesInGroup: maleCount,
          femalesInGroup: femaleCount,
        });
        toast({
          title: "Guest Updated",
          description: "The guest list attendance is successfully updated",
        });
      } catch (error) {
        console.error("Error Updating guests:", error);
        toast({
          title: "Error",
          description: "Failed update guest. Please try again",
          variant: "destructive",
        });
      } finally {
        setIsEditModalOpen(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditModalOpen(false);
  };

  if (!result) {
    return <div>Loading...</div>;
  }

  const { event, totalFemales, totalMales } = result;

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{event.name} - Guest List</CardTitle>
        <div>Total Males: {totalMales}</div>
        <div>Total Females: {totalFemales}</div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4">
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
          <Select value={selectedPromoter} onValueChange={setSelectedPromoter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by promoter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Promoters</SelectItem>
              {promoters.map((promoter) => (
                <SelectItem key={promoter} value={promoter}>
                  {promoter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {promoterTotals && (
            <div>
              <div>
                {promoterTotals.promoterName} - Total Males:{" "}
                {promoterTotals.totalMales}
              </div>
              <div>
                {promoterTotals.promoterName} - Total Females:{" "}
                {promoterTotals.totalFemales}
              </div>
            </div>
          )}
        </div>
        <Table>
          <TableCaption>List of guests for {event.name}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Promoter</TableHead>
              <TableHead>M</TableHead>
              <TableHead>F</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.map((guest: Guest) => (
              <TableRow
                key={guest.id}
                {...(canCheckGuests
                  ? {
                      onClick: () => handleEdit(guest),
                      className: "cursor-pointer hover:bg-gray-100",
                    }
                  : {})}
              >
                <TableCell>
                  {guest.attended ? (
                    <FaCheck className="text-green-500" />
                  ) : null}
                </TableCell>
                <TableCell>{guest.name}</TableCell>
                <TableCell>{guest.promoterName}</TableCell>
                <TableCell>{guest.malesInGroup || 0}</TableCell>
                <TableCell>{guest.femalesInGroup || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Guest: {editingGuest?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <label>Males:</label>
              <Button onClick={() => setMaleCount(Math.max(0, maleCount - 1))}>
                <FaMinus />
              </Button>
              <Input
                type="number"
                value={maleCount}
                onChange={(e) => setMaleCount(Number(e.target.value))}
                className="w-20"
              />
              <Button onClick={() => setMaleCount(maleCount + 1)}>
                <FaPlus />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <label>Females:</label>
              <Button
                onClick={() => setFemaleCount(Math.max(0, femaleCount - 1))}
              >
                <FaMinus />
              </Button>
              <Input
                type="number"
                value={femaleCount}
                onChange={(e) => setFemaleCount(Number(e.target.value))}
                className="w-20"
              />
              <Button onClick={() => setFemaleCount(femaleCount + 1)}>
                <FaPlus />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GuestListPage;
