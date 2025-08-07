"use client";

import CompanyCard from "../components/cards/CompanyCard";
import { OrganizationDetails } from "@/types/types";
import CustomCard from "@/components/shared/cards/CustomCard";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { handleQueryComponentState } from "@/utils/handleQueryState";
import { QueryState } from "@/types/enums";

const CompaniesContent = () => {
  const organizationsResponse = useQuery(api.organizations.getAllOrganizations);
  const result = handleQueryComponentState(organizationsResponse);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const companies = result.data.organizationDetails;

  return (
    <SectionContainer>
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
    </SectionContainer>
  );
};

export default CompaniesContent;
