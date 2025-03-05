import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { PiNewspaper } from "react-icons/pi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DetailsSkeleton from "./loading/DetailsSkeleton";
import { TbCircleLetterM } from "react-icons/tb";
import { TbCircleLetterF } from "react-icons/tb";
import { FiClock } from "react-icons/fi";
import {
  TicketInfoSchema,
  TicketSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import TicketCard from "./cards/TicketCard";
import ResponsiveConfirm from "./responsive/ResponsiveConfirm";
import { ClerkPermissions, ResponseStatus } from "../../../../utils/enum";
import { useToast } from "@/hooks/use-toast";
import { FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { MdOutlineCancel } from "react-icons/md";
import useMediaQuery from "@/hooks/useMediaQuery";
import { Gender } from "@/types/enums";
import { formatToTimeAndShortDate, isPast } from "../../../../utils/luxon";
import { Promoter } from "@/types/types";

interface TicketInfoTabProps {
  ticketData?: TicketInfoSchema | null;
  canViewAllTickets?: boolean;
  eventId: Id<"events">;
  promoterUserId?: Id<"users"> | null;
  hasPromoCode?: boolean;
  has: any;
  slug: string;
}

const TicketInfoTab: React.FC<TicketInfoTabProps> = ({
  ticketData,
  eventId,
  promoterUserId,
  has,
  slug,
}) => {
  const { toast } = useToast();
  const hasPromoCode = has({ permission: ClerkPermissions.UPLOAD_GUESTLIST });
  const canViewAllTickets = has({
    permission: ClerkPermissions.VIEW_ALL_GUESTLISTS,
  });
  const canCheckInGuests: boolean = has({
    permission: ClerkPermissions.CHECK_GUESTS,
  });

  const [isLoadingPromoters, setIsLoadingPromoters] = useState<boolean>(false);

  // ticket check in
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [showRedeemTicket, setShowRedeemTicket] = useState<boolean>(false);
  const [redeemTicketError, setRedeemTicketError] = useState<string | null>(
    null
  );
  const [isRedeemTicketLoading, setIsRedeemTicketLoading] =
    useState<boolean>(false);
  const checkInTicket = useMutation(api.tickets.checkInTicket);

  // ticket serach
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const responseTickets = useQuery(api.tickets.getTicketsByEventId, {
    eventId,
  });

  // Promoter Ticket Sales
  const [selectedPromoterId, setSelectedPromoterId] = useState<
    string | Id<"users">
  >("all");

  const genderTotals: {
    male: number;
    female: number;
  } = useMemo(() => {
    if (!responseTickets || !responseTickets.data)
      return { male: 0, female: 0 };

    const filteredTickets = responseTickets?.data.tickets.filter(
      (ticket: TicketSchema) => {
        if (selectedPromoterId === "all") {
          return ticket.userPromoterId !== null;
        }
        return ticket.userPromoterId === selectedPromoterId;
      }
    );

    const totals = { male: 0, female: 0 };

    filteredTickets.forEach((ticket) => {
      if (ticket.gender === Gender.Male) {
        totals.male += 1;
      } else if (ticket.gender === Gender.Female) {
        totals.female += 1;
      }
    });

    return totals;
  }, [responseTickets, selectedPromoterId]);

  const filteredGuests = useMemo(() => {
    if (!responseTickets || !responseTickets.data) return [];
    return responseTickets.data.tickets.filter(
      (ticket: TicketSchemaWithPromoter) =>
        ticket.ticketUniqueId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [responseTickets, searchTerm]);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { maleTickets, femaleTickets } = useMemo(() => {
    if (!responseTickets || !responseTickets.data)
      return { maleTickets: 0, femaleTickets: 0 };

    return responseTickets.data.tickets.reduce(
      (acc, ticket: TicketSchema) => {
        if (ticket.gender === Gender.Male) {
          acc.maleTickets++;
        } else if (ticket.gender === Gender.Female) {
          acc.femaleTickets++;
        }
        return acc;
      },
      { maleTickets: 0, femaleTickets: 0 }
    );
  }, [responseTickets]);

  const responsePromoters = useQuery(
    api.organizations.getPromotersBySlug,
    canViewAllTickets ? { slug } : "skip"
  );
  const responseTotalPromoCodeUsage = useQuery(
    api.promoCodeUsage.getTotalPromoCodeUsageByEvent,
    canViewAllTickets ? { eventId } : "skip"
  );

  const shouldFetchPromoterUsage =
    (canViewAllTickets && selectedPromoterId !== "all") ||
    (!canViewAllTickets && promoterUserId);

  const selectedPromoterUserId: Id<"users"> | null = canViewAllTickets
    ? (selectedPromoterId as Id<"users">)
    : promoterUserId || null;

  const responseSelectedPromoterUsage = useQuery(
    api.promoCodeUsage.getPromoCodeUsageByPromoterAndEvent,
    shouldFetchPromoterUsage && selectedPromoterUserId
      ? { promoterUserId: selectedPromoterUserId, eventId }
      : "skip"
  );

  useEffect(() => {
    if (!responsePromoters) {
      setIsLoadingPromoters(true);
    } else {
      setIsLoadingPromoters(false);
    }
  }, [responsePromoters]);

  const isTicketsSalesOpen = !isPast(ticketData?.ticketSalesEndTime ?? 0);

  const handleConfirmRedeem = async () => {
    setRedeemTicketError(null);

    if (selectedTicketId.trim() === "") {
      setRedeemTicketError("No ticket selected");
      return;
    }
    setIsRedeemTicketLoading(true);
    try {
      const response = await checkInTicket({
        ticketUniqueId: selectedTicketId,
      });
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: "Ticket Redeemed",
        });
        setShowRedeemTicket(false);
        setSelectedTicketId("");
      } else {
        console.error("error redeeming ticket", response.error);
        setRedeemTicketError(response.error);
      }
    } catch (error) {
      console.error("error redeeming ticket", error);
      setRedeemTicketError("Error Redeeming Ticket");
    } finally {
      setIsRedeemTicketLoading(false);
    }
  };

  // No tickets
  if (!ticketData) {
    return (
      <div className="mb-4 flex flex-col gap-4 bg-gray-100 min-h-[100vh]">
        <div className=" bg-white w-[95%] mx-auto px-4 pt-4 mt-4 rounded-md mb-4 shadow-md">
          <h1 className="text-2xl font-bold pb-3">Ticket Info</h1>
          <div className="flex items-center  space-x-3 py-3 ">
            <PiNewspaper className="text-2xl" />
            <p>There is no ticket option for this event</p>
          </div>
        </div>
      </div>
    );
  }

  // Promoter
  if (hasPromoCode) {
    if (!responseSelectedPromoterUsage) {
      return <DetailsSkeleton />;
    }
    if (responseSelectedPromoterUsage && responseSelectedPromoterUsage.data) {
      return (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Your Promo Code Usage</h3>
          <div className="flex">
            <TbCircleLetterM className="text-2xl pr-1" />
            <p className="mb-1">
              Male Tickets: {responseSelectedPromoterUsage.data.maleUsageCount}
            </p>
          </div>
          <div className="flex">
            <TbCircleLetterF className="text-2xl pr-1" />
            <p>
              Female Tickets:{" "}
              {responseSelectedPromoterUsage.data.femaleUsageCount}
            </p>
          </div>
        </div>
      );
    }
    if (responseSelectedPromoterUsage.error) {
      return <div>Error loading promoting usage</div>;
    }
    return <div>No Information</div>;
  }

  return (
    <div className="mb-4 flex flex-col gap-4 bg-gray-100 min-h-[100vh]">
      <div className=" bg-white w-[95%] mx-auto px-4 pt-4 mt-4 rounded-md mb-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold pt-2 pb-3">Ticket Sales</h1>
          {!isTicketsSalesOpen && (
            <p className="text-red-700 font-semibold">Closed</p>
          )}
        </div>
        <div className="flex items-center space-x-3 py-3 border-b">
          <FiClock className="text-2xl text-gray-900" />
          <p>
            {isTicketsSalesOpen ? "Ticket Sales Ends:" : "Ticket Sales Ended"}{" "}
            <span className="text-gray-700 font-semibold">
              {formatToTimeAndShortDate(ticketData.ticketSalesEndTime)}
            </span>
          </p>
        </div>
        <div className="flex items-center  space-x-3 py-3 border-b">
          <TbCircleLetterM className="text-2xl" />
          <p>
            Male Tickets Sold:{" "}
            <span className="text-gray-700 font-semibold">
              {maleTickets} / {ticketData.ticketTypes.male.capacity}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3 py-3">
          <TbCircleLetterF className="text-2xl" />
          <p>
            Female Tickets Sold:{" "}
            <span className="text-gray-700 font-semibold">
              {femaleTickets} / {ticketData.ticketTypes.female.capacity}
            </span>
          </p>
        </div>
      </div>
      <div className=" bg-white w-[95%] mx-auto px-4 pt-4 mt-4 rounded-md mb-4 shadow-md">
        <h2 className="text-2xl font-bold pt-2 pb-4">Promoter Ticket Sales</h2>
        <Select onValueChange={setSelectedPromoterId} defaultValue="all">
          <SelectTrigger className=" mb-2">
            <SelectValue placeholder="Select Promoter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Promoters</SelectItem>

            {isLoadingPromoters ? (
              <SelectItem value="loading" disabled>
                Loading Promoters...
              </SelectItem>
            ) : responsePromoters?.status === ResponseStatus.ERROR ? (
              <SelectItem value="error" disabled>
                Error loading promoters
              </SelectItem>
            ) : (
              responsePromoters?.data && (
                <>
                  {responsePromoters.data.promoters.map(
                    (promoter: Promoter) => (
                      <SelectItem
                        key={promoter.promoterUserId}
                        value={promoter.promoterUserId || "unkown"}
                      >
                        {promoter.name}
                      </SelectItem>
                    )
                  )}
                </>
              )
            )}
          </SelectContent>
        </Select>
        {selectedPromoterId === "all" ? (
          responseTotalPromoCodeUsage?.data ? (
            <div className="">
              <div className="flex items-center space-x-3 py-3 border-b">
                <TbCircleLetterM className="text-2xl " />
                <p className="">
                  Male Tickets Sold:{" "}
                  <span className="text-gray-700 font-semibold">
                    {genderTotals.male}
                  </span>
                </p>
              </div>
              <div className="flex items-center space-x-3 py-3 ">
                <TbCircleLetterF className="text-2xl " />
                <p>
                  Female Tickets Sold:{" "}
                  <span className="text-gray-700 font-semibold">
                    {genderTotals.female}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <DetailsSkeleton />
          )
        ) : responseSelectedPromoterUsage &&
          responseSelectedPromoterUsage.data &&
          responseTotalPromoCodeUsage?.data ? (
          <div className="mt-4">
            <p className="mb-1">
              Male Tickets Redeemed:{" "}
              {selectedPromoterId === "all"
                ? responseTotalPromoCodeUsage?.data.totalMaleUsage
                : responseSelectedPromoterUsage.data.maleUsageCount}{" "}
            </p>
            <p>
              Female Tickets Redeemed:{" "}
              {selectedPromoterId === "all"
                ? responseTotalPromoCodeUsage?.data.totalFemaleUsage
                : responseSelectedPromoterUsage.data.femaleUsageCount}{" "}
            </p>
          </div>
        ) : responseSelectedPromoterUsage &&
          responseSelectedPromoterUsage.error ? (
          <p>Error loading promoter usage.</p>
        ) : (
          <DetailsSkeleton />
        )}
      </div>
      {(canCheckInGuests || canViewAllTickets) &&
        responseTickets?.data?.tickets && (
          <>
            <div
              className="relative flex items-center bg-white mx-3 p-3 rounded-md shadow"
              onClick={() => {
                if (searchInputRef.current && !isDesktop) {
                  searchInputRef.current.focus(); // Ensure the input gains focus
                  setTimeout(() => {
                    const rect =
                      searchInputRef.current!.getBoundingClientRect(); // Non-null assertion
                    const scrollTop =
                      window.scrollY || document.documentElement.scrollTop;
                    window.scrollTo({
                      top: scrollTop + rect.top - 20, // Adjust `20` for spacing
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
                placeholder="Search Ticket ID..."
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
              {filteredGuests.map((ticket: TicketSchemaWithPromoter) => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  canCheckInTickets={canCheckInGuests}
                  setSelectedTicketId={setSelectedTicketId}
                  setShowRedeemTicket={setShowRedeemTicket}
                />
              ))}
            </div>
          </>
        )}
      <ResponsiveConfirm
        isOpen={showRedeemTicket}
        title={"Redeem Ticket"}
        confirmText={"Redeem"}
        cancelText={"Cancel"}
        content={`Redeem ticket for ${selectedTicketId}`}
        error={redeemTicketError}
        isLoading={isRedeemTicketLoading}
        modalProps={{
          onClose: () => {
            setShowRedeemTicket(false);
            setSelectedTicketId("");
            setRedeemTicketError(null);
          },
          onConfirm: handleConfirmRedeem,
        }}
        drawerProps={{
          onSubmit: handleConfirmRedeem,
          onOpenChange: (open) => {
            setShowRedeemTicket(false);
            setSelectedTicketId("");
            setRedeemTicketError(null);
          },
        }}
      />
    </div>
  );
};

export default TicketInfoTab;
