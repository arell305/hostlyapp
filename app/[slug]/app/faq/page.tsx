"use client";

import PageContainer from "@/components/shared/containers/PageContainer";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import FAQQuery from "./FAQQuery";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { canCreateEvent } from "@/utils/permissions";
import { Plus } from "lucide-react";
import ResponsiveAddFaq from "../components/responsive/ResponsiveAddFaq";

const FAQPage = () => {
  const { orgRole, organization } = useContextOrganization();
  const canAddFAQ = canCreateEvent(orgRole);
  const [isAddingFAQ, setIsAddingFAQ] = useState<boolean>(false);

  const handleOpenAddFAQ = () => {
    setIsAddingFAQ(true);
  };

  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="FAQ"
        actions={
          canAddFAQ && (
            <Button
              size="heading"
              className="gap-1 w-[80px]"
              onClick={handleOpenAddFAQ}
            >
              <Plus size={20} />
              <span>FAQ</span>
            </Button>
          )
        }
      />
      <FAQQuery />
      {isAddingFAQ && (
        <ResponsiveAddFaq
          isOpen={isAddingFAQ}
          onOpenChange={setIsAddingFAQ}
          organizationId={organization._id}
        />
      )}
    </PageContainer>
  );
};

export default FAQPage;
