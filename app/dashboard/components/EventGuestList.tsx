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
import DetailsSkeleton from "./loading/DetailsSkeleton";
import { TbCircleLetterF, TbCircleLetterM } from "react-icons/tb";
import { GuestWithPromoter } from "@/types";
import { FiClock } from "react-icons/fi";
import { formatToTimeAndShortDate } from "../../../utils/helpers";
import moment from "moment";

interface EventGuestListProps {
  eventId: Id<"events">;
  endTime: string;
  guestListCloseTime: string;
}

const EventGuestList = ({
  eventId,
  endTime,
  guestListCloseTime,
}: EventGuestListProps) => {
  const getEventWithGuestListsResponse = useQuery(
    api.events.getEventWithGuestLists,
    { eventId }
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPromoter, setSelectedPromoter] = useState<string>("all");
  const [guests, setGuests] = useState<GuestWithPromoter[]>([]);

  const promoters: string[] = useMemo(() => {
    if (!getEventWithGuestListsResponse || !getEventWithGuestListsResponse.data)
      return [];
    return Array.from(
      new Set(
        getEventWithGuestListsResponse.data.guests.map(
          (guest) => guest.promoterName
        )
      )
    );
  }, [getEventWithGuestListsResponse]);

  const filteredGuests = useMemo(() => {
    if (!getEventWithGuestListsResponse || !getEventWithGuestListsResponse.data)
      return [];
    return getEventWithGuestListsResponse.data.guests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedPromoter === "all" || guest.promoterName === selectedPromoter)
    );
  }, [getEventWithGuestListsResponse, searchTerm, selectedPromoter]);

  const totals = useMemo(() => {
    const guests =
      selectedPromoter === "all"
        ? getEventWithGuestListsResponse?.data?.guests
        : filteredGuests;
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
  }, [getEventWithGuestListsResponse, filteredGuests, selectedPromoter]);

  useEffect(() => {
    if (
      selectedPromoter === "all" &&
      getEventWithGuestListsResponse &&
      getEventWithGuestListsResponse.data
    ) {
      setGuests(getEventWithGuestListsResponse.data.guests);
    } else if (
      getEventWithGuestListsResponse &&
      getEventWithGuestListsResponse.data
    ) {
      const filteredGuests =
        getEventWithGuestListsResponse &&
        getEventWithGuestListsResponse.data.guests.filter(
          (guest) => guest.promoterName === selectedPromoter
        );
      setGuests(filteredGuests);
      // Console log filtered guests
    }
  }, [selectedPromoter, getEventWithGuestListsResponse]);

  const now = moment();
  const hasEnded = now.isAfter(moment(endTime));
  const guestListClosed = now.isAfter(moment(guestListCloseTime));

  if (getEventWithGuestListsResponse === undefined) {
    return <DetailsSkeleton />;
  }

  return (
    <div className="mb-4 flex flex-col">
      <div>
        <h2 className="text-xl font-semibold mb-2">Headcount</h2>
        {hasEnded ? (
          <div className="flex text-gray-500">
            <FiClock className="text-2xl pr-1 " />
            <p className={" mb-1"}>
              Event Ended: {formatToTimeAndShortDate(endTime)}
            </p>
          </div>
        ) : (
          <div className="flex">
            <FiClock className="text-2xl pr-1 400" />
            <p className={"mb-1"}>
              Event Ends: {formatToTimeAndShortDate(endTime)}
            </p>
          </div>
        )}

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
        <div className="mb-3 border-b border-altGray">
          <div className="flex">
            <TbCircleLetterM className="text-2xl pr-1" />
            <p>Males Attended: {totals.totalMales}</p>
          </div>
          <div className="flex">
            <TbCircleLetterF className="text-2xl pr-1" />
            <p className="pb-2">Females Attended: {totals.totalFemales}</p>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Guests</h2>
        {guestListClosed ? (
          <div className="flex text-gray-500">
            <FiClock className="text-2xl pr-1 " />
            <p className={" mb-1"}>
              RSVP closed: ${formatToTimeAndShortDate(guestListCloseTime)}
            </p>
          </div>
        ) : (
          <div className="flex">
            <FiClock className="text-2xl pr-1 400" />
            <p className={"mb-1"}>
              RSVP closes: {formatToTimeAndShortDate(guestListCloseTime)}
            </p>
          </div>
        )}

        <div className="flex items-center">
          <FaSearch className="text-gray-400 mr-2" />
          <Input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1" // Allow input to take available space
          />
        </div>
        <div className="">
          {filteredGuests.map((guest: GuestWithPromoter) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              canEditGuests={false}
              canSeePromoterName={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventGuestList;
