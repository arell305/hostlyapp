"use client";

import { OrganizationDetails } from "@shared/types/types";
import CustomCard from "@shared/ui/cards/CustomCard";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import PageContainer from "@shared/ui/containers/PageContainer";
import CompanyCard from "@/features/companies/components/CompanyCard";

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
