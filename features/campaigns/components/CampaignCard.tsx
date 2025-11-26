"use client";

import CustomCard from "@shared/ui/cards/CustomCard";
import { CardHeader, CardTitle } from "@shared/ui/primitive/card";
import { Doc, Id } from "convex/_generated/dataModel";
import Link from "next/link";
import ResponsiveCampaignActions from "./buttons/ResponsiveCampaignActions";
import { Loader2 } from "lucide-react";
import CampaignBadgesRow from "./campaign/CampaignBadgesRow";
import FieldErrorMessage from "@/shared/ui/error/FieldErrorMessage";

interface CampaignCardProps {
  campaign: Doc<"campaigns">;
  href: string;
  onDelete: (id: Id<"campaigns">) => void;
  onCancel: (id: Id<"campaigns">) => void;
  onReactivate: (id: Id<"campaigns">) => void;
  onResume: (id: Id<"campaigns">) => void;
  onEdit: (campaign: Doc<"campaigns">) => void;
  isLoading?: boolean;
  error?: string | null;
}

const CampaignCard = ({
  campaign,
  href,
  onDelete,
  onCancel,
  onReactivate,
  onResume,
  onEdit,
  isLoading = false,
  error,
}: CampaignCardProps) => {
  return (
    <Link href={href} className="block">
      <CustomCard className="hover:shadow-glow-white min-h-[80px]">
        <CardHeader className="flex flex-row justify-between space-y-0">
          <div className="flex flex-col gap-y-1">
            <CardTitle>{campaign.name}</CardTitle>
            <CampaignBadgesRow campaign={campaign} />
          </div>

          <div className="flex flex-col items-end">
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ResponsiveCampaignActions
                campaign={campaign}
                onDelete={onDelete}
                onCancel={onCancel}
                onReactivate={onReactivate}
                onResume={onResume}
                onEdit={onEdit}
              />
            )}
            <FieldErrorMessage error={error} />
          </div>
        </CardHeader>
      </CustomCard>
    </Link>
  );
};

export default CampaignCard;
