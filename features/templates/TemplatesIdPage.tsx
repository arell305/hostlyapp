"use client";

import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import { useRef, useState } from "react";
import { AddButton } from "@shared/ui/buttonContainers/NewItemButton";
import TemplatesQuery from "@/features/templates/components/TemplateLoader";
import ResponsiveAddTemplate from "@/features/templates/components/ResponsiveAddTemplate";
import SearchInput from "../events/components/SearchInput";

const TemplateClientPage = () => {
  const [isAddingTemplate, setIsAddingTemplate] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAddTemplate = () => {
    setIsAddingTemplate(true);
  };
  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Templates"
        actions={<AddButton onClick={handleOpenAddTemplate} label="Template" />}
      />
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
        placeholder="Search templates..."
      />
      <TemplatesQuery searchTerm={searchTerm} />

      <ResponsiveAddTemplate
        isOpen={isAddingTemplate}
        onOpenChange={setIsAddingTemplate}
      />
    </PageContainer>
  );
};

export default TemplateClientPage;
