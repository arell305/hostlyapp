"use client";

import { useCreateCampaignForm } from "@/features/campaigns/contexts/CampaignFormContext";
import EditableTemplate from "./EditableTemplate";
import SelectedTemplate from "./SelectedTemplate";
import CampaignTemplateLoader from "./CampaignTemplateLoader";

const CampaignTemplateBody = () => {
  const { templateMode } = useCreateCampaignForm();

  return (
    <>
      {templateMode === "list" && <CampaignTemplateLoader />}
      {templateMode === "custom" && <EditableTemplate />}
      {templateMode === "existing" && <SelectedTemplate />}
    </>
  );
};

export default CampaignTemplateBody;
