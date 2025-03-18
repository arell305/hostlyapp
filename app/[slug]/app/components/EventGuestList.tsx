import React, { useMemo, useRef, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
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
import { GuestWithPromoter } from "@/types/types";
import { FiClock } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import useMediaQuery from "@/hooks/useMediaQuery";
import { formatToTimeAndShortDate, isPast } from "../../../../utils/luxon";

interface EventGuestListProps {
  eventId: Id<"events">;
  guestListCloseTime: number;
  isCheckInOpen: boolean;
  checkInCloseTime: number;
}

const EventGuestList = ({
  eventId,
  guestListCloseTime,
  isCheckInOpen,
  checkInCloseTime,
}: EventGuestListProps) => {
  const getEventWithGuestListsResponse = useQuery(
    api.events.getEventWithGuestLists,
    { eventId }
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPromoter, setSelectedPromoter] = useState<string>("all");

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const guestListClosed = isPast(guestListCloseTime);

  const formattedCheckInEndTime = formatToTimeAndShortDate(checkInCloseTime);

  if (getEventWithGuestListsResponse === undefined) {
    return <DetailsSkeleton />;
  }

  return (
    <div className="mb-4 flex flex-col gap-4 bg-gray-100 min-h-[100vh]">
      <div className=" bg-white w-[95%] mx-auto px-4 pt-4 mt-4 rounded-md mb-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold  pb-3">Guest List</h1>
          {!isCheckInOpen && (
            <p className="text-red-700 font-semibold">Check In Closed</p>
          )}
        </div>
        <div className="flex items-center space-x-3 py-3 border-b">
          <FiClock className="text-2xl text-gray-900" />
          <p>
            {guestListClosed ? "RSVPS Closed:" : "RSVPS Closes"}{" "}
            <span className="text-gray-700 font-semibold">
              {formatToTimeAndShortDate(guestListCloseTime)}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3 py-3">
          <FiClock className="text-2xl text-gray-900" />
          <p>
            {isCheckInOpen ? "Check In Ends:" : "Check In Ended:"}{" "}
            <span className="text-gray-700 font-semibold">
              {formattedCheckInEndTime}
            </span>
          </p>
        </div>
      </div>
      <div className=" bg-white w-[95%] mx-auto px-4 py-4 mt-2 rounded-md mb-4 shadow-md">
        <Select value={selectedPromoter} onValueChange={setSelectedPromoter}>
          <SelectTrigger>
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
          <div className="flex items-center  space-x-3 py-3 border-b">
            <TbCircleLetterM className="text-2xl" />
            <p>
              Males Attended:{" "}
              <span className="text-gray-700 font-semibold">
                {totals.totalMales}
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-3 py-3">
            <TbCircleLetterF className="text-2xl" />
            <p>
              Females Attended:{" "}
              <span className="text-gray-700 font-semibold">
                {totals.totalFemales}
              </span>
            </p>
          </div>
        </div>
        <div
          className="relative items-center flex"
          onClick={() => {
            if (searchInputRef.current && !isDesktop) {
              searchInputRef.current.focus();
              setTimeout(() => {
                const rect = searchInputRef.current!.getBoundingClientRect();
                const scrollTop =
                  window.scrollY || document.documentElement.scrollTop;
                window.scrollTo({
                  top: scrollTop + rect.top - 20,
                  behavior: "smooth",
                });
              }, 100);
            }
          }}
        >
          <FaSearch className="absolute left-2 text-gray-700" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm !== "" && (
            <MdOutlineCancel
              onClick={() => setSearchTerm("")}
              className="cursor-pointer absolute right-4 text-gray-500 hover:text-gray-600 text-2xl"
            />
          )}
        </div>
      </div>
      <div className="bg-white">
        {filteredGuests.map((guest: GuestWithPromoter) => (
          <GuestCard
            key={guest.id}
            guest={guest}
            canEditGuests={false}
            canSeePromoterName={true}
            isCheckInOpen={isCheckInOpen}
          />
        ))}
      </div>
    </div>
  );
};

export default EventGuestList;
