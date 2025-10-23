"use client";

import { useContextOrganization } from "@/contexts/OrganizationContext";
import { useCustomer } from "@/domain/customers";
import SubscriptionPageContent from "./SubscriptionPageContent";
import SubscriptionSkeleton from "@/shared/ui/skeleton/SubscriptionSkeleton";

const CustomerLoader = () => {
  const { organization } = useContextOrganization();
  const customer = useCustomer(organization._id);

  if (!customer) {
    return <SubscriptionSkeleton />;
  }

  return <SubscriptionPageContent customer={customer} />;
};

export default CustomerLoader;
