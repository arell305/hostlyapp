import React, { useMemo, useRef, useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { GetEventWithGuestListsData } from "@/types/convex-types";
import useMediaQuery from "@/hooks/useMediaQuery";
import { formatToTimeAndShortDate } from "../../../../../utils/luxon";
import { GuestWithPromoter } from "@/types/types";
import { useUpdateGuestAttendance } from "../hooks/useUpdateGuestAttendance";
import { FiClock } from "react-icons/fi";
import { TbCircleLetterF, TbCircleLetterM } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { MdOutlineCancel } from "react-icons/md";
import GuestCard from "../../components/GuestCard";
import ResponsiveGuestCheckIn from "../../components/responsive/ResponsiveGuestCheckIn";
import {
  filterGuestsByName,
  getTotalFemales,
  getTotalMales,
} from "../../../../../utils/format";

interface ModeratorGuestListContentProps {
  eventId: Id<"events">;
  isCheckInOpen: boolean;
  checkInCloseTime: number;
  guestList: GetEventWithGuestListsData;
}

const ModeratorGuestListContent = ({
  eventId,
  isCheckInOpen,
  checkInCloseTime,
  guestList,
}: ModeratorGuestListContentProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const formattedCheckInEndTime = formatToTimeAndShortDate(checkInCloseTime);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestWithPromoter | null>(
    null
  );

  const {
    updateGuestAttendance,
    isLoading: isCheckInGuestLoading,
    error: checkInGuestError,
    setError: setIsCheckInGuestError,
  } = useUpdateGuestAttendance();

  const filteredGuests = useMemo(() => {
    return filterGuestsByName(guestList.guests, searchTerm);
  }, [guestList, searchTerm]);

  const totals = useMemo(() => {
    if (!guestList.guests) return { totalMales: 0, totalFemales: 0 };

    return {
      totalMales: getTotalMales(guestList.guests),
      totalFemales: getTotalFemales(guestList.guests),
    };
  }, [guestList]);

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
    setIsCheckInGuestError(null);
  };

  const handleSaveGuestUpdate = async (
    guestId: string,
    maleCount: number,
    femaleCount: number
  ) => {
    if (!selectedGuest || !selectedGuest.guestListId) {
      setIsCheckInGuestError("No guest selected");
      return;
    }

    const succss = await updateGuestAttendance(
      selectedGuest.guestListId,
      guestId,
      true,
      maleCount,
      femaleCount
    );

    if (succss) {
      closeModal();
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 bg-gray-100 min-h-[150vh]">
        <div className=" bg-white w-[95%] mx-auto px-4 pt-4 mt-4 rounded-md mb-4 shadow-md">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold pt-2 pb-4">Guest List</h1>
            {!isCheckInOpen && (
              <p className="text-red-700 font-semibold">Check In Closed</p>
            )}
          </div>
          <div className="flex items-center space-x-3 py-3 border-b">
            <FiClock className="text-2xl text-gray-900" />
            <p>
              {isCheckInOpen ? "Check In Ends:" : "Check In Ended:"}{" "}
              <span className="text-gray-700 font-semibold">
                {formattedCheckInEndTime}
              </span>
            </p>
          </div>
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
          className="relative flex items-center bg-white mx-3 p-3 rounded-md shadow"
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
            className="pl-6"
          />
          {searchTerm !== "" && (
            <MdOutlineCancel
              onClick={() => setSearchTerm("")}
              className="cursor-pointer absolute right-4 text-gray-700 hover:text-gray-600 text-2xl"
            />
          )}
        </div>

        <div className="bg-white">
          {filteredGuests.map((guest: GuestWithPromoter) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              canEditGuests={false}
              canSeePromoterName={true}
              canCheckInGuests={true}
              onCheckIn={handleCheckInGuest}
              isCheckInOpen={isCheckInOpen}
            />
          ))}
        </div>
      </div>
      {selectedGuest && (
        <ResponsiveGuestCheckIn
          isOpen={isModalOpen}
          onClose={closeModal}
          guest={selectedGuest}
          onSave={handleSaveGuestUpdate}
          isLoading={isCheckInGuestLoading}
          error={checkInGuestError}
        />
      )}
    </>
  );
};

export default ModeratorGuestListContent;
