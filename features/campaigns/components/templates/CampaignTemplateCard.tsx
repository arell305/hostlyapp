import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/shared/lib/utils";
import CustomCard from "@/shared/ui/cards/CustomCard";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitive/card";
import React from "react";

interface CampaignTemplateCardProps {
  name: string;
  body: string;
  onSelect: (templateId: Id<"smsTemplates"> | null) => void;
  isSelected: boolean;
  templateId: Id<"smsTemplates"> | null;
}

const CampaignTemplateCard: React.FC<CampaignTemplateCardProps> = ({
  name,
  body,
  onSelect,
  isSelected,
  templateId,
}) => {
  return (
    <CustomCard
      onClick={() => onSelect(templateId)}
      className={cn(
        "cursor-pointer hover:shadow-glow-white",
        isSelected ? "shadow-glow-primary" : ""
      )}
    >
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
    </CustomCard>
  );
};

export default CampaignTemplateCard;
