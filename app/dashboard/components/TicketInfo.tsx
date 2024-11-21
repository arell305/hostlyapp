import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DetailsSkeleton from "./loading/DetailsSkeleton";

interface TicketInfoProps {
  ticketInfo: {
    maleTicketPrice: number;
    femaleTicketPrice: number;
    maleTicketCapacity: number;
    femaleTicketCapacity: number;
    ticketSalesEndTime: string;
    totalMaleTicketsSold: number;
    totalFemaleTicketsSold: number;
  } | null;
  canViewAllTickets: boolean;
  eventId: Id<"events">;
  promoterClerkId?: string | null;
  hasPromoCode: boolean;
}

interface Promoter {
  clerkUserId: string | undefined;
  name: string | undefined;
}

const TicketInfo: React.FC<TicketInfoProps> = ({
  ticketInfo,
  canViewAllTickets,
  eventId,
  promoterClerkId,
  hasPromoCode,
}) => {
  const { organization, isLoaded } = useOrganization();
  const [selectedPromoter, setSelectedPromoter] = useState<string>("all");
  const promoters = useQuery(
    api.organizations.getPromotersByOrganization,
    canViewAllTickets && organization?.id
      ? { clerkOrganizationId: organization.id }
      : "skip"
  );

  const totalPromoCodeUsage = useQuery(
    api.promoCodeUsage.getTotalPromoCodeUsageByEvent,
    canViewAllTickets ? { eventId } : "skip"
  );

  const selectedPromoterUsage = useQuery(
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
  console.log("canViewAllTickets", canViewAllTickets);

  if (!ticketInfo) {
    return <p>No ticket option for this event.</p>;
  }
  if (!isLoaded) {
    return <div>Loading</div>;
  }

  if (hasPromoCode) {
    if (selectedPromoterUsage) {
      return (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Your Promo Code Usage</h3>
          <p className="mb-1">
            Male Tickets: {selectedPromoterUsage.maleUsageCount}
          </p>
          <p>Female Tickets: {selectedPromoterUsage.femaleUsageCount}</p>
        </div>
      );
    }
    return <div>No Information</div>;
  }

  return (
    <>
      <div className="bg-green-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-2">Tickets Sold</h2>
        <p className="mb-1">
          Male Tickets Sold: {ticketInfo.totalMaleTicketsSold}
        </p>
        <p>Female Tickets Sold: {ticketInfo.totalFemaleTicketsSold}</p>
      </div>
      <div className="bg-pink-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-2">Promo Code Redemptions</h2>
        <Select onValueChange={setSelectedPromoter} defaultValue="all">
          <SelectTrigger className="w-[180px] mb-2">
            <SelectValue placeholder="Select Promoter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Promoters</SelectItem>
            {promoters?.map((promoter: Promoter) => (
              <SelectItem
                key={promoter.clerkUserId}
                value={promoter.clerkUserId as string}
              >
                {promoter.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPromoter === "all" ? (
          totalPromoCodeUsage ? (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Total Promo Code Usage
              </h3>
              <p className="mb-1">
                Male Tickets: {totalPromoCodeUsage.totalMaleUsage}
              </p>
              <p>Female Tickets: {totalPromoCodeUsage.totalFemaleUsage}</p>
            </div>
          ) : (
            <DetailsSkeleton />
          )
        ) : selectedPromoterUsage ? (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">
              Selected Promoter Usage
            </h3>
            <p className="mb-1">
              Male Tickets: {selectedPromoterUsage.maleUsageCount}
            </p>
            <p>Female Tickets: {selectedPromoterUsage.femaleUsageCount}</p>
          </div>
        ) : (
          <DetailsSkeleton />
        )}
      </div>
    </>
  );
};

export default TicketInfo;
