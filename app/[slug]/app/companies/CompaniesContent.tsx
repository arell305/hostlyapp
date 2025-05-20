"use client";

import CompanyCard from "../components/cards/CompanyCard";
import { OrganizationDetails } from "@/types/types";
import CustomCard from "@/components/shared/cards/CustomCard";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import SectionContainer from "@/components/shared/containers/SectionContainer";

interface CompaniesContentProps {
  organizations: OrganizationDetails[];
}

const CompaniesContent: React.FC<CompaniesContentProps> = ({
  organizations,
}) => {
  return (
    <SectionContainer>
      <SectionHeaderWithAction title="Companies" />

      <CustomCard>
        {organizations
          .filter((company) => company.slug !== "admin")
          .map((company) => (
            <CompanyCard key={company.organizationId} company={company} />
          ))}
      </CustomCard>
    </SectionContainer>
  );
};

export default CompaniesContent;
