"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { QueryState } from "@/types/enums";
import { handleQueryState } from "../../../../utils/handleQueryState";
import CompaniesContent from "./CompaniesContent";

const CompaniesPage = () => {
  const organizationsResponse = useQuery(api.organizations.getAllOrganizations);
  const result = handleQueryState(organizationsResponse);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const organizations = result.data.organizationDetails;

  return <CompaniesContent organizations={organizations} />;
};

export default CompaniesPage;
