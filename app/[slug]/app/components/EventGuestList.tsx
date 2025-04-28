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
import { MdOutlineCancel } from "react-icons/md";
import useMediaQuery from "@/hooks/useMediaQuery";
import CustomCard from "@/components/shared/cards/CustomCard";

interface EventGuestListProps {
  eventId: Id<"events">;
  isCheckInOpen: boolean;
}

const EventGuestList = ({ eventId, isCheckInOpen }: EventGuestListProps) => {
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

  if (getEventWithGuestListsResponse === undefined) {
    return <DetailsSkeleton />;
  }

  return (
    <div>
      <CustomCard>
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
        <div className="mb-3 ">
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
      </CustomCard>
      <CustomCard>
        {filteredGuests.map((guest: GuestWithPromoter) => (
          <GuestCard
            key={guest.id}
            guest={guest}
            canEditGuests={false}
            canSeePromoterName={true}
            isCheckInOpen={isCheckInOpen}
          />
        ))}
      </CustomCard>
    </div>
  );
};

export default EventGuestList;
