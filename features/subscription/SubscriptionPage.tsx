"use client";
import { useContextOrganization } from "@/shared/hooks/contexts";
import { isAdminOrHostlyAdmin } from "@/shared/utils/permissions";
import ErrorPage from "@shared/ui/error/ErrorPage";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import PageContainer from "@shared/ui/containers/PageContainer";
import CustomerLoader from "@/features/subscription/components/CustomerLoader";

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
      <CustomerLoader />
    </PageContainer>
  );
};

export default SubscriptionPage;
