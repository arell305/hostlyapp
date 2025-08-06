"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { QueryState } from "@/types/enums";
import { handleQueryState } from "../../../../utils/handleQueryState";
import CompaniesContent from "./CompaniesContent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isHostlyUser } from "@/utils/permissions";
import ErrorPage from "../components/errors/ErrorPage";

const CompaniesPage = () => {
  const organizationsResponse = useQuery(api.organizations.getAllOrganizations);
  const result = handleQueryState(organizationsResponse);
  const { orgRole } = useContextOrganization();
  const preventAccess = !isHostlyUser(orgRole);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  if (preventAccess) {
    return (
      <ErrorPage
        title="Unauthorized Access"
        description="You are not authorized to access this page. Please contact support if you believe this is an error."
      />
    );
  }

  const organizations = result.data.organizationDetails;

  return <CompaniesContent organizations={organizations} />;
};

export default CompaniesPage;
