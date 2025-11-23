"use client";

import { useCampaignForm } from "@/features/campaigns/contexts/CampaignFormContext";
import EditableTemplate from "./EditableTemplate";
import SelectedTemplate from "./SelectedTemplate";
import CampaignTemplateQuery from "./CampaignTemplateQuery";

const CampaignTemplateBody = () => {
  const { templateMode } = useCampaignForm();

  return (
    <>
      {templateMode === "list" && <CampaignTemplateQuery />}
      {templateMode === "custom" && <EditableTemplate />}
      {templateMode === "existing" && <SelectedTemplate />}
    </>
  );
};

export default CampaignTemplateBody;
