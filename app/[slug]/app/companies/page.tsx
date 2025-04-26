"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/router";
import { api } from "../../../../convex/_generated/api";
import { QueryState } from "@/types/enums";
import { handleQueryState } from "../../../../utils/handleQueryState";
import CompaniesContent from "./CompaniesContent";

const CompaniesPage = () => {
  const router = useRouter();
  const organizationsResponse = useQuery(api.organizations.getAllOrganizations);
  const result = handleQueryState(organizationsResponse);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const organizations = result.data.organizationDetails;

  const handleCompanyClick = (slug: string) => {
    router.push(`/${slug}/app/`);
  };

  return (
    <CompaniesContent
      organizations={organizations}
      onCompanyClick={handleCompanyClick}
    />
  );
};

export default CompaniesPage;
