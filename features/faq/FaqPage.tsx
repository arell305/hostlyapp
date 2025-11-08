"use client";

import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import { useState } from "react";
import FaqLoader from "@/features/faq/components/FaqLoader";
import { useContextOrganization } from "@/shared/hooks/contexts";
import { canCreateEvent } from "@/shared/utils/permissions";
import { Plus } from "lucide-react";
import ResponsiveAddFaq from "@/features/faq/components/ResponsiveAddFaq";
import SectionHeadingButton from "@/shared/ui/buttonContainers/SectionHeadingButton";

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
            <SectionHeadingButton
              onClick={handleOpenAddFAQ}
              label="FAQ"
              icon={Plus}
              className="w-[80px]"
              showMobileIcon={false}
            />
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
