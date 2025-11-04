"use client";

import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import React, { useState } from "react";
import FaqLoader from "@/features/faq/components/FaqLoader";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { canCreateEvent } from "@/shared/utils/permissions";
import { Plus } from "lucide-react";
import ResponsiveAddFaq from "@/features/faq/components/ResponsiveAddFaq";
import { Button } from "@/shared/ui/primitive/button";

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
      <FaqLoader />
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
