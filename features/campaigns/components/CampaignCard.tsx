"use client";

import CustomCard from "@shared/ui/cards/CustomCard";
import { CardHeader, CardTitle } from "@shared/ui/primitive/card";
import { Doc, Id } from "convex/_generated/dataModel";
import Link from "next/link";
import ResponsiveCampaignActions from "./buttons/ResponsiveCampaignActions";

interface CampaignCardProps {
  campaign: Doc<"campaigns">;
  href: string;
  onDelete: (id: Id<"campaigns">) => void;
  onCancel: (id: Id<"campaigns">) => void;
  onReactivate: (id: Id<"campaigns">) => void;
  onResume: (id: Id<"campaigns">) => void;
  onEdit: () => void;
}

const CampaignCard = ({
  campaign,
  href,
  onDelete,
  onCancel,
  onReactivate,
  onResume,
  onEdit,
}: CampaignCardProps) => {
  return (
    <Link href={href} className="">
      <CustomCard className="hover:shadow-glow-white ">
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>{campaign.name}</CardTitle>
          <ResponsiveCampaignActions
            campaign={campaign}
            onDelete={onDelete}
            onCancel={onCancel}
            onReactivate={onReactivate}
            onResume={onResume}
            onEdit={onEdit}
          />
        </CardHeader>
      </CustomCard>
    </Link>
  );
};

export default CampaignCard;
