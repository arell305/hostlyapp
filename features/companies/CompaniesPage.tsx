"use client";

import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isHostlyUser } from "@/shared/utils/permissions";
import ErrorPage from "@shared/ui/error/ErrorPage";
import FullLoading from "@shared/ui/loading/FullLoading";
import GetAllCompanies from "./components/AllCompaniesLoader";

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

  return <GetAllCompanies />;
};

export default CompaniesPage;
