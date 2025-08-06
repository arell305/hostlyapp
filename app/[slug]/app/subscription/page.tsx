"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ErrorComponent from "../components/errors/ErrorComponent";
import FullLoading from "../components/loading/FullLoading";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { CustomerSchema } from "@/types/schemas-types";
import { ResponseStatus } from "@/types/enums";
import SubscriptionContent from "./SubscriptionContent";
import { isAdmin, isAdminOrHostlyAdmin } from "../../../../utils/permissions";
import ErrorPage from "../components/errors/ErrorPage";
import MessagePage from "@/components/shared/shared-page/MessagePage";

const SubscriptionPage = () => {
  const {
    organization,
    organizationContextLoading,
    organizationContextError,
    subscription,
    availableCredits,
    orgRole,
  } = useContextOrganization();

  const customerDetails = useQuery(
    api.customers.getCustomerDetails,
    organization
      ? {
          organizationId: organization._id,
        }
      : "skip"
  );

  if (
    organizationContextLoading ||
    !subscription ||
    !organization ||
    !customerDetails
  ) {
    return <FullLoading />;
  }

  if (organizationContextError) {
    return (
      <MessagePage
        title="Error"
        description={`${organizationContextError || "An error occurred"}. Please contact support if you believe this is an error.`}
        buttonLabel="Home"
      />
    );
  }

  if (customerDetails.status === ResponseStatus.ERROR) {
    return (
      <MessagePage
        title="Error"
        description={`${customerDetails.error || "An error occurred"}. Please contact support if you believe this is an error.`}
        buttonLabel="Home"
      />
    );
  }
  const customer: CustomerSchema = customerDetails.data?.customer;
  const canEditSettings = isAdmin(orgRole);
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
    <SubscriptionContent
      customer={customer}
      subscription={subscription}
      canEditSettings={canEditSettings}
      availableCredits={availableCredits}
    />
  );
};

export default SubscriptionPage;
