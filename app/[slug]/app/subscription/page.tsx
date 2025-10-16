"use client";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isAdminOrHostlyAdmin } from "../../../../utils/permissions";
import ErrorPage from "../components/errors/ErrorPage";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import PageContainer from "@/components/shared/containers/PageContainer";
import CustomerQuery from "@/components/customers/queries/CustomerQuery";

const SubscriptionPage = () => {
  const { orgRole } = useContextOrganization();

  const preventAccess = !isAdminOrHostlyAdmin(orgRole);

  if (preventAccess) {
    return (
      <ErrorPage
        title="Unauthorized Access"
        description="You are not authorized to access this page. Please contact support if you believe this is an error."
      />
    );
  }

  return (
    <PageContainer>
      <SectionHeaderWithAction title="Subscription" />
      <CustomerQuery />
    </PageContainer>
  );
};

export default SubscriptionPage;
