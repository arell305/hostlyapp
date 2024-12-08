import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { TicketInfo } from "@/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DetailsSkeleton from "./loading/DetailsSkeleton";
import { UserRole } from "../../../utils/enum";
import { TbCircleLetterM } from "react-icons/tb";
import { TbCircleLetterF } from "react-icons/tb";

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

  if (!ticketData) {
    return <p>No ticket option for this event.</p>;
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
    <>
      <div className="border-b mb-2 pb-2">
        <h2 className="text-xl font-semibold mb-2">Sales</h2>
        <div className="flex">
          <TbCircleLetterM className="text-2xl pr-1" />
          <p className="mb-1">
            Male Tickets Sold: {ticketData.totalMaleTicketsSold} /{" "}
            {ticketData.maleTicketCapacity}
          </p>
        </div>
        <div className="flex">
          <TbCircleLetterF className="text-2xl pr-1" />
          <p>
            Female Tickets Sold: {ticketData.totalFemaleTicketsSold} /{" "}
            {ticketData.femaleTicketCapacity}
          </p>
        </div>
      </div>
      <div className="border-b mt-4 mb-4 pb-2">
        <h2 className="text-xl font-semibold mb-2">Promo Code Usage</h2>

        <Select onValueChange={setSelectedPromoter} defaultValue="all">
          <SelectTrigger className="w-[75%] sm:w-[240px] mb-2">
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
            <div className="mt-4">
              <div className="flex">
                <TbCircleLetterM className="text-2xl pr-1" />
                <p className="mb-1">
                  Male Tickets Redeemed:{" "}
                  {responseTotalPromoCodeUsage?.data.totalMaleUsage}
                </p>
              </div>
              <div className="flex">
                <TbCircleLetterF className="text-2xl pr-1" />
                <p>
                  Female Tickets Redeemed:{" "}
                  {responseTotalPromoCodeUsage?.data.totalFemaleUsage}
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
    </>
  );
};

export default TicketInfoTab;
