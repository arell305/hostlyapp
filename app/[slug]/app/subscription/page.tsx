"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ErrorComponent from "../components/errors/ErrorComponent";
import FullLoading from "../components/loading/FullLoading";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { CustomerSchema } from "@/types/schemas-types";
import { ResponseStatus } from "@/types/enums";
import SubscriptionContent from "./SubscriptionContent";
import { isAdmin } from "../../../../utils/permissions";

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
    return <ErrorComponent message={organizationContextError} />;
  }

  if (customerDetails.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={customerDetails.error} />;
  }
  const customer: CustomerSchema = customerDetails.data?.customer;
  const canEditSettings = isAdmin(orgRole);

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
