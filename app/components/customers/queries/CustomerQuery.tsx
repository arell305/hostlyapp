import SubscriptionContent from "@/[slug]/app/subscription/SubscriptionPageContent";
import SubscriptionSkeleton from "@/components/shared/skeleton/SubscriptionSkeleton";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { useCustomer } from "@/hooks/convex/customers";
import React from "react";

const CustomerQuery = () => {
  const { organization } = useContextOrganization();
  const customer = useCustomer(organization._id);

  if (!customer) {
    return <SubscriptionSkeleton />;
  }

  return <SubscriptionContent customer={customer} />;
};

export default CustomerQuery;
