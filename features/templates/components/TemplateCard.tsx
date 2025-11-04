"use client";

import { Doc, Id } from "@convex/_generated/dataModel";
import CustomCard from "@shared/ui/cards/CustomCard";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/ui/primitive/card";
import EditDeleteIcons from "@/shared/ui/buttonContainers/EditDeleteIcons";

interface TemplateCardProps {
  template: Doc<"smsTemplates">;
  onDelete: (templateId: Id<"smsTemplates">) => void;
  onEdit: (template: Doc<"smsTemplates">) => void;
}

const TemplateCard = ({ template, onDelete, onEdit }: TemplateCardProps) => {
  return (
    <CustomCard>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 mb-2">
          <CardTitle className="truncate">{template.name}</CardTitle>
          <EditDeleteIcons
            onEdit={() => onEdit(template)}
            onDelete={() => onDelete(template._id)}
          />
        </div>
        <CardDescription className="line-clamp-2">
          {template.body}
        </CardDescription>
      </CardHeader>
    </CustomCard>
  );
};

export default TemplateCard;
