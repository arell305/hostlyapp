"use client";

import PageContainer from "@/components/shared/containers/PageContainer";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import React from "react";
import UsersByOrgForModQuery from "@/components/moderators/UsersByOrgForModQuery";
const FAQPage = () => {
  return (
    <PageContainer>
      <SectionHeaderWithAction title="Templates For Users" />
      <p className="text-grayText ">Select a user to view their campaigns</p>

      <UsersByOrgForModQuery page="templates" />
    </PageContainer>
  );
};

export default FAQPage;
