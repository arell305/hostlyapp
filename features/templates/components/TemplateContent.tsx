"use client";

import { Doc } from "@convex/_generated/dataModel";
import TemplateCard from "./TemplateCard";

interface TemplateContentProps {
  smsTemplates: Doc<"smsTemplates">[];
}

const TemplateContent = ({ smsTemplates }: TemplateContentProps) => {
  return (
    <div>
      {smsTemplates.map((template) => (
        <TemplateCard key={template._id} template={template} />
      ))}
    </div>
  );
};

export default TemplateContent;
