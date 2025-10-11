"use client";

import PageContainer from "@/components/shared/containers/PageContainer";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import React, { useState } from "react";
import { AddButton } from "@/components/shared/buttonContainers/NewItemButton";
import TemplatesQuery from "./TemplateQuery";
import ResponsiveAddTemplate from "./ResponsiveAddTemplate";

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
