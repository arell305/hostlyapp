"use client";

import { Doc } from "@convex/_generated/dataModel";
import CustomCard from "@shared/ui/cards/CustomCard";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/ui/primitive/card";

interface TemplateCardProps {
  template: Doc<"smsTemplates">;
}

const TemplateCard = ({ template }: TemplateCardProps) => {
  return (
    <CustomCard>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.body}</CardDescription>
      </CardHeader>
    </CustomCard>
  );
};

export default TemplateCard;
