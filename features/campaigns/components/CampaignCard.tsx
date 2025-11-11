"use client";

import CustomCard from "@shared/ui/cards/CustomCard";
import { CardHeader, CardTitle } from "@shared/ui/primitive/card";
import { Doc } from "convex/_generated/dataModel";
import Link from "next/link";

interface CampaignCardProps {
  campaign: Doc<"campaigns">;
  href: string;
}

const CampaignCard = ({ campaign, href }: CampaignCardProps) => {
  return (
    <Link href={href} className="">
      <CustomCard className="hover:shadow-glow-white ">
        <CardHeader>
          <CardTitle>{campaign.name}</CardTitle>
        </CardHeader>
      </CustomCard>
    </Link>
  );
};

export default CampaignCard;
