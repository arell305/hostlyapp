"use client";

import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import { useState } from "react";
import { AddButton } from "@shared/ui/buttonContainers/NewItemButton";
import TemplatesQuery from "@/features/templates/components/TemplateLoader";
import ResponsiveAddTemplate from "@/features/templates/components/ResponsiveAddTemplate";

const TemplateClientPage = () => {
  const [isAddingTemplate, setIsAddingTemplate] = useState<boolean>(false);

  const handleOpenAddTemplate = () => {
    setIsAddingTemplate(true);
  };
  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Templates"
        actions={<AddButton onClick={handleOpenAddTemplate} label="Template" />}
      />

      <TemplatesQuery />

      <ResponsiveAddTemplate
        isOpen={isAddingTemplate}
        onOpenChange={setIsAddingTemplate}
      />
    </PageContainer>
  );
};

export default TemplateClientPage;
