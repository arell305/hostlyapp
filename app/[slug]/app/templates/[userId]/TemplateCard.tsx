import React from "react";
import { Doc } from "convex/_generated/dataModel";
import CustomCard from "@/components/shared/cards/CustomCard";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
