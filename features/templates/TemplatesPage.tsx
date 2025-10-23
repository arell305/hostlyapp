"use client";

import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import UsersByOrgForModQuery from "@/features/moderators/components/UsersByOrgForModQuery";
const TemplatesPage = () => {
  return (
    <PageContainer>
      <SectionHeaderWithAction title="Templates For Users" />
      <p className="text-grayText ">Select a user to view their campaigns</p>

      <UsersByOrgForModQuery page="templates" />
    </PageContainer>
  );
};

export default TemplatesPage;
