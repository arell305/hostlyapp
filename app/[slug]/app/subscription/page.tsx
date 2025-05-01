"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import ErrorComponent from "../components/errors/ErrorComponent";
import FullLoading from "../components/loading/FullLoading";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { CustomerSchema } from "@/types/schemas-types";
import { ResponseStatus } from "@/types/enums";
import SubscriptionContent from "./SubscriptionContent";
import { isAdmin } from "../../../../utils/permissions";

const SubscriptionPage = () => {
  const { user } = useUser();

  const [refreshKey, setRefreshKey] = useState(0);

  const {
    organization,
    organizationContextLoading,
    organizationContextError,
    subscription,
  } = useContextOrganization();

  const customerDetails = useQuery(
    api.customers.getCustomerDetails,
    organization
      ? {
          organizationId: organization._id,
        }
      : "skip"
  );

  useEffect(() => {}, [, refreshKey]);

  if (
    organizationContextLoading ||
    !subscription ||
    !organization ||
    !customerDetails ||
    !user
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
  const orgRole = user?.publicMetadata.role as string;
  const canEditSettings = isAdmin(orgRole);

  return (
    <SubscriptionContent
      customer={customer}
      subscription={subscription}
      canEditSettings={canEditSettings}
    />
  );
};

export default SubscriptionPage;
