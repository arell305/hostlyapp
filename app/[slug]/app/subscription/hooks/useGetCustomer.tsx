import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import { ResponseStatus } from "@/types/enums";
import SubscriptionSkeleton from "@/components/shared/skeleton/SubscriptionSkeleton";
import { useContextOrganization } from "@/contexts/OrganizationContext";

export const useGetCustomer = () => {
  const { organization } = useContextOrganization();

  const customer = useQuery(api.customers.getCustomerDetails, {
    organizationId: organization._id,
  });

  if (customer === undefined) {
    return { component: <SubscriptionSkeleton />, customer: null };
  }

  if (customer?.status === ResponseStatus.ERROR) {
    return {
      component: (
        <ErrorComponent
          message={`${customer.error || "An error occurred"}. `}
        />
      ),
      customer: null,
    };
  }

  return { component: null, customer: customer.data.customer };
};
