"use client";

import UsersByOrgForModQuery from "@/features/moderators/components/UsersByOrgForModQuery";
import PageContainer from "@/shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@/shared/ui/headings/SectionHeaderWithAction";

const CampaignsPage = () => {
  return (
    <PageContainer>
      <SectionHeaderWithAction title="Campaigns For Users" />
      <p className="text-grayText ">Select a user to view their campaigns</p>
      <UsersByOrgForModQuery page="campaigns" />
    </PageContainer>
  );
};

export default CampaignsPage;
