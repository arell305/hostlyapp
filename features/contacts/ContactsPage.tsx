"use client";

import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import UsersByOrgForModQuery from "@/features/moderators/components/UsersByOrgForModQuery";

const ContactsPage = () => {
  return (
    <PageContainer>
      <SectionHeaderWithAction title="Contacts For Users" />
      <p className="text-grayText ">Select a user to view their contacts</p>
      <UsersByOrgForModQuery page="contacts" />
    </PageContainer>
  );
};

export default ContactsPage;
