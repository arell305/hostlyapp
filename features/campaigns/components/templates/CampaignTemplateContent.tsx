"use client";

import { Doc } from "@/convex/_generated/dataModel";
import CampaignTemplateContainer from "./CampaignTemplateContainer";

interface CampaignTemplateContentProps {
  smsTemplates: Doc<"smsTemplates">[];
  searchTerm: string;
}
const CampaignTemplateContent: React.FC<CampaignTemplateContentProps> = ({
  smsTemplates,
  searchTerm,
}) => {
  const filteredTemplates = smsTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return <CampaignTemplateContainer smsTemplates={filteredTemplates} />;
};

export default CampaignTemplateContent;
