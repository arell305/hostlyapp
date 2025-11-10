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
  template: Doc<"smsTemplates">;
  onSelect: (templateId: Id<"smsTemplates">) => void;
  isSelected: boolean;
}

const CampaignTemplateCard: React.FC<CampaignTemplateCardProps> = ({
  template,
  onSelect,
  isSelected,
}) => {
  return (
    <CustomCard
      onClick={() => onSelect(template._id)}
      className={cn(
        "cursor-pointer hover:shadow-glow-white",
        isSelected ? "shadow-glow-primary" : ""
      )}
    >
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.body}</CardDescription>
      </CardHeader>
    </CustomCard>
  );
};

export default CampaignTemplateCard;
