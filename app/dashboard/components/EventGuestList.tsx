import React, { useEffect, useMemo, useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GuestCard from "./GuestCard";

interface EventGuestListProps {
  eventId: Id<"events">;
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

const EventGuestList = ({ eventId }: EventGuestListProps) => {
  const result = useQuery(api.events.getEventWithGuestLists, { eventId });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPromoter, setSelectedPromoter] = useState<string>("all");
  const [guests, setGuests] = useState<Guest[]>([]);

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

  const totals = useMemo(() => {
    const guests = selectedPromoter === "all" ? result?.guests : filteredGuests;
    if (!guests) return { totalMales: 0, totalFemales: 0 };

    const totalMales = guests.reduce(
      (sum, guest) => sum + (guest.malesInGroup || 0),
      0
    );
    const totalFemales = guests.reduce(
      (sum, guest) => sum + (guest.femalesInGroup || 0),
      0
    );
    return { totalMales, totalFemales };
  }, [result, filteredGuests, selectedPromoter]);

  useEffect(() => {
    if (selectedPromoter === "all" && result) {
      setGuests(result.guests);
    } else if (result) {
      const filteredGuests = result.guests.filter(
        (guest) => guest.promoterName === selectedPromoter
      );
      setGuests(filteredGuests);
      // Console log filtered guests
    }
  }, [selectedPromoter, result]);

  if (!result) {
    return <div>Loading...</div>;
  }
  return (
    <>
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
        <div>
          <div>
            {selectedPromoter === "all" ? "All Promoters" : selectedPromoter} -
            Total Males: {totals.totalMales}
          </div>
          <div>
            {selectedPromoter === "all" ? "All Promoters" : selectedPromoter} -
            Total Females: {totals.totalFemales}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map((guest: Guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              canEditGuests={false}
              canSeePromoterName={true}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default EventGuestList;
