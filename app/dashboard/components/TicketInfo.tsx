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
  canEdit: boolean;
  eventId: Id<"events">;
  promoterClerkId?: string | null;
}

interface Promoter {
  clerkUserId: string | undefined;
  name: string | undefined;
}

const TicketInfo: React.FC<TicketInfoProps> = ({
  ticketInfo,
  canEdit,
  eventId,
  promoterClerkId,
}) => {
  const { organization, isLoaded } = useOrganization();
  const [selectedPromoter, setSelectedPromoter] = useState<string>("all");

  const promoters = useQuery(
    api.organizations.getPromotersByOrganization,
    canEdit && organization?.id
      ? { clerkOrganizationId: organization.id }
      : "skip"
  );

  const totalPromoCodeUsage = useQuery(
    api.promoCodeUsage.getTotalPromoCodeUsageByEvent,
    canEdit ? { eventId } : "skip"
  );

  const selectedPromoterUsage = useQuery(
    api.promoCodeUsage.getPromoCodeUsageByPromoterAndEvent,
    (canEdit && selectedPromoter !== "all") || (!canEdit && promoterClerkId)
      ? {
          clerkPromoterUserId: canEdit ? selectedPromoter : promoterClerkId!,
          eventId,
        }
      : "skip"
  );

  if (!ticketInfo) {
    return <p>No ticket options for this event</p>;
  }
  if (!isLoaded) {
    return <div>Loading</div>;
  }

  if (!canEdit) {
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
    // Or return a message that the user doesn't have permission to view this information
  }
  if (canEdit) {
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
          {selectedPromoter === "all" && totalPromoCodeUsage && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Total Promo Code Usage
              </h3>
              <p className="mb-1">
                Male Tickets: {totalPromoCodeUsage.totalMaleUsage}
              </p>
              <p>Female Tickets: {totalPromoCodeUsage.totalFemaleUsage}</p>
            </div>
          )}
          {selectedPromoter !== "all" && selectedPromoterUsage && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Selected Promoter Usage
              </h3>
              <p className="mb-1">
                Male Tickets: {selectedPromoterUsage.maleUsageCount}
              </p>
              <p>Female Tickets: {selectedPromoterUsage.femaleUsageCount}</p>
            </div>
          )}
        </div>
      </>
    );
  }
};

export default TicketInfo;
