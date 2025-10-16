"use client";

import { OrganizationDetails } from "@/types/types";
import CustomCard from "@/components/shared/cards/CustomCard";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import PageContainer from "@/components/shared/containers/PageContainer";
import CompanyCard from "@/[slug]/app/components/cards/CompanyCard";

interface CompaniesContentProps {
  companies: OrganizationDetails[];
}

const CompaniesContent = ({ companies }: CompaniesContentProps) => {
  return (
    <PageContainer>
      <SectionHeaderWithAction title="Companies" />

      {companies.length > 0 && (
        <CustomCard>
          {companies
            .filter((company: OrganizationDetails) => company.slug !== "admin")
            .map((company: OrganizationDetails) => (
              <CompanyCard key={company.organizationId} company={company} />
            ))}
        </CustomCard>
      )}
    </PageContainer>
  );
};

export default CompaniesContent;
