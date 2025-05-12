"use client";

import React, { useState } from "react";
import CompanyCard from "../components/cards/CompanyCard";
import { OrganizationDetails } from "@/types/types";
import { SubscriptionStatus, SubscriptionTier } from "@/types/enums";
import CustomCard from "@/components/shared/cards/CustomCard";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import ToggleTabs from "@/components/shared/toggle/ToggleTabs";
import SectionContainer from "@/components/shared/containers/SectionContainer";

interface CompaniesContentProps {
  organizations: OrganizationDetails[];
  onCompanyClick: (slug: string) => void;
}

const CompaniesContent: React.FC<CompaniesContentProps> = ({
  organizations,
  onCompanyClick,
}) => {
  const [selectedTab, setSelectedTab] = useState<
    "active" | "trial" | "deleted"
  >("active");

  return (
    <SectionContainer>
      <SectionHeaderWithAction title="Companies" />

      <CustomCard>
        {organizations
          .filter((company) => company.slug !== "admin")
          .map((company) => (
            <CompanyCard
              key={company.organizationId}
              company={company}
              handleCompanyClick={() => onCompanyClick(company.slug)}
            />
          ))}
      </CustomCard>
    </SectionContainer>
  );
};

export default CompaniesContent;
