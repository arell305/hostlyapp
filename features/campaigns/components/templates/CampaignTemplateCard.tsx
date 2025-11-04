import { Doc, Id } from "@/convex/_generated/dataModel";
import CustomCard from "@/shared/ui/cards/CustomCard";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitive/card";
import React from "react";

interface CampaignTemplateCardProps {
  template: Doc<"smsTemplates">;
  onSelect: (templateId: Id<"smsTemplates">) => void;
}

const CampaignTemplateCard: React.FC<CampaignTemplateCardProps> = ({
  template,
  onSelect,
}) => {
  return (
    <CustomCard
      onClick={() => onSelect(template._id)}
      className="cursor-pointer hover:bg-cardBackgroundHover"
    >
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.body}</CardDescription>
      </CardHeader>
    </CustomCard>
  );
};

export default CampaignTemplateCard;
