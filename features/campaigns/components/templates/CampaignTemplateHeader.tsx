"use client";

import { useCampaignForm } from "@/features/campaigns/contexts/CampaignFormContext";
import { getTemplateTitle } from "@/features/campaigns/utils/helpers";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/shared/ui/primitive/button";

const CampaignTemplateHeader = () => {
  const {
    templateMode,
    setTemplateMode,
    updateFormData,
    template,
    setTemplate,
  } = useCampaignForm();

  const showCustomButton = templateMode === "list";
  const showBackButton = templateMode !== "list";
  const templateTitle = getTemplateTitle(templateMode, template?.name);

  const handleCustomTemplate = () => {
    setTemplateMode("custom");
  };

  const handleBack = () => {
    setTemplateMode("list");
    updateFormData({ templateId: undefined, body: null });
    setTemplate(null);
  };

  return (
    <div className="flex  justify-between">
      <div className="flex items-center gap-x-2">
        {showBackButton && (
          <IconButton icon={<ArrowLeftIcon />} onClick={handleBack} />
        )}
        <h2>{templateTitle}</h2>
      </div>
      {showCustomButton && (
        <Button
          variant="secondaryAction"
          className="rounded-md w-auto"
          onClick={handleCustomTemplate}
          size="xs"
        >
          Custom Template
        </Button>
      )}
    </div>
  );
};

export default CampaignTemplateHeader;
