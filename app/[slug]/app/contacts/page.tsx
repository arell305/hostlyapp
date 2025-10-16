"use client";
import PageContainer from "@/components/shared/containers/PageContainer";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import UsersByOrgForModQuery from "@/components/moderators/UsersByOrgForModQuery";

const CampaignsPage = () => {
  return (
    <PageContainer>
      <SectionHeaderWithAction title="Contacts For Users" />
      <p className="text-grayText ">Select a user to view their contacts</p>
      <UsersByOrgForModQuery page="contacts" />
    </PageContainer>
  );
};

export default CampaignsPage;
