import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { TicketInfo } from "@/types/types";
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
import moment from "moment";
import { formatToTimeAndShortDate } from "../../../../utils/helpers";

interface TicketInfoTabProps {
  ticketData?: TicketInfo | null;
  canViewAllTickets?: boolean;
  eventId: Id<"events">;
  promoterClerkId?: string | null;
  hasPromoCode?: boolean;
  has: any;
  clerkOrganizationId: string;
}

const TicketInfoTab: React.FC<TicketInfoTabProps> = ({
  ticketData,
  eventId,
  promoterClerkId,
  has,
  clerkOrganizationId,
}) => {
  const hasPromoCode = has({ permission: "org:events:upload_guest_list" });
  const canViewAllTickets = has({
    permission: "org:events:view_all_guestlists",
  });

  const [selectedPromoter, setSelectedPromoter] = useState<string>("all");
  const [isLoadingPromoters, setIsLoadingPromoters] = useState<boolean>(false);
  const responsePromoters = useQuery(
    api.organizations.getPromotersByOrganization,
    canViewAllTickets ? { clerkOrganizationId } : "skip"
  );
  const responseTotalPromoCodeUsage = useQuery(
    api.promoCodeUsage.getTotalPromoCodeUsageByEvent,
    canViewAllTickets ? { eventId } : "skip"
  );

  const responseSelectedPromoterUsage = useQuery(
    api.promoCodeUsage.getPromoCodeUsageByPromoterAndEvent,
    (canViewAllTickets && selectedPromoter !== "all") ||
      (!canViewAllTickets && promoterClerkId)
      ? {
          clerkPromoterUserId: canViewAllTickets
            ? selectedPromoter
            : promoterClerkId!,
          eventId,
        }
      : "skip"
  );

  useEffect(() => {
    if (responsePromoters === undefined) {
      setIsLoadingPromoters(true);
    } else {
      setIsLoadingPromoters(false);
    }
  }, [responsePromoters]);
  const now = moment();
  const isTicketsSalesOpen = now.isAfter(
    moment(ticketData?.ticketSalesEndTime)
  );

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
              {formatToTimeAndShortDate(ticketData?.ticketSalesEndTime || "")}
            </span>
          </p>
        </div>
        <div className="flex items-center  space-x-3 py-3 border-b">
          <TbCircleLetterM className="text-2xl" />
          <p>
            Male Tickets Sold:{" "}
            <span className="text-gray-700 font-semibold">
              {ticketData?.totalMaleTicketsSold} /{" "}
              {ticketData?.maleTicketCapacity}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3 py-3">
          <TbCircleLetterF className="text-2xl" />
          <p>
            Female Tickets Sold:{" "}
            <span className="text-gray-700 font-semibold">
              {ticketData?.totalFemaleTicketsSold} /{" "}
              {ticketData?.femaleTicketCapacity}
            </span>
          </p>
        </div>
      </div>
      <div className=" bg-white w-[95%] mx-auto px-4 pt-4 mt-4 rounded-md mb-4 shadow-md">
        <h2 className="text-2xl font-bold pt-2 pb-4">Promo Code Usage</h2>
        <Select onValueChange={setSelectedPromoter} defaultValue="all">
          <SelectTrigger className=" mb-2">
            <SelectValue placeholder="Select Promoter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Promoters</SelectItem>

            {isLoadingPromoters ? (
              <SelectItem value="loading" disabled>
                Loading Promoters...
              </SelectItem>
            ) : responsePromoters?.error && !responsePromoters?.data ? (
              <SelectItem value="error" disabled>
                Error loading promoters
              </SelectItem>
            ) : (
              responsePromoters?.data && ( // Check if data exists before mapping
                <>
                  {responsePromoters.data.map((promoter) => (
                    <SelectItem
                      key={promoter.clerkUserId}
                      value={promoter.clerkUserId || "unkown"}
                    >
                      {promoter.name}
                    </SelectItem>
                  ))}
                </>
              )
            )}
          </SelectContent>
        </Select>
        {selectedPromoter === "all" ? (
          responseTotalPromoCodeUsage?.data ? (
            <div className="">
              <div className="flex items-center space-x-3 py-3 border-b">
                <TbCircleLetterM className="text-2xl " />
                <p className="">
                  Male Tickets Redeemed:{" "}
                  <span className="text-gray-700 font-semibold">
                    {responseTotalPromoCodeUsage?.data.totalMaleUsage}
                  </span>
                </p>
              </div>
              <div className="flex items-center space-x-3 py-3 ">
                <TbCircleLetterF className="text-2xl " />
                <p>
                  Female Tickets Redeemed:{" "}
                  <span className="text-gray-700 font-semibold">
                    {responseTotalPromoCodeUsage?.data.totalFemaleUsage}
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
              {selectedPromoter === "all"
                ? responseTotalPromoCodeUsage?.data.totalMaleUsage
                : responseSelectedPromoterUsage.data.maleUsageCount}{" "}
            </p>
            <p>
              Female Tickets Redeemed:{" "}
              {selectedPromoter === "all"
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
    </div>
  );
};

export default TicketInfoTab;
