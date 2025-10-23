"use client";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isAdmin } from "@/shared/utils/permissions";
import ErrorPage from "@shared/ui/error/ErrorPage";
import ConnectedAccountQueryByClerkId from "@/features/stripe/components/ConnectedAccountQueryByClerkId";

const StripePage = () => {
  const { orgRole } = useContextOrganization();

  const isCompanymin = isAdmin(orgRole);

  if (!isCompanymin) {
    return (
      <ErrorPage
        title="Unauthorized Access"
        description="You are not authorized to access this page. Please contact support if you believe this is an error."
      />
    );
  }
  return <ConnectedAccountQueryByClerkId />;
};

export default StripePage;
