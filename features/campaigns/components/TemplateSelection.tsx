"use client";

import SectionContainer from "@/shared/ui/containers/SectionContainer";
import CampaignTemplateLoader from "./templates/CampaignTemplateLoader";
import { Button } from "@/shared/ui/primitive/button";
import ResponsiveAddTemplate from "@/features/templates/components/ResponsiveAddTemplate";
import { useState } from "react";

const TemplateSelection = () => {
  const [isAddingTemplate, setIsAddingTemplate] = useState<boolean>(false);

  const handleAddNewTemplate = () => {
    setIsAddingTemplate(true);
  };
  return (
    <SectionContainer>
      {" "}
      <div className="flex  justify-between">
        <h2>Select Template</h2>
        <Button
          variant="link"
          size="xs"
          className="text-white "
          onClick={handleAddNewTemplate}
        >
          Add New Template
        </Button>
      </div>
      <CampaignTemplateLoader />
      <ResponsiveAddTemplate
        isOpen={isAddingTemplate}
        onOpenChange={setIsAddingTemplate}
      />
    </SectionContainer>
  );
};

export default TemplateSelection;
