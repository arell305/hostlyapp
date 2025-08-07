"use client";

import CompaniesContent from "./CompaniesContent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isHostlyUser } from "@/utils/permissions";
import ErrorPage from "../components/errors/ErrorPage";
import FullLoading from "../components/loading/FullLoading";

const CompaniesPage = () => {
  const { orgRole } = useContextOrganization();

  if (!orgRole) {
    return <FullLoading />;
  }

  const preventAccess = !isHostlyUser(orgRole);

  if (preventAccess) {
    return (
      <ErrorPage
        title="Unauthorized Access"
        description="You are not authorized to access this page. Please contact support if you believe this is an error."
      />
    );
  }

  return <CompaniesContent />;
};

export default CompaniesPage;
