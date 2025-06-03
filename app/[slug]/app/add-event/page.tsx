"use client";

import { FC } from "react";

import FullLoading from "../components/loading/FullLoading";
import ErrorComponent from "../components/errors/ErrorComponent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import AddEventContent from "./AddEventContent";
import { isAdmin } from "@/utils/permissions";

const AddEventPage: FC = () => {
  const {
    organization,
    organizationContextError,
    subscription,
    connectedAccountEnabled,
    availableCredits,
    user,
    orgRole,
  } = useContextOrganization();
  const isCompanyAdmin = isAdmin(orgRole);

  if (
    !subscription ||
    connectedAccountEnabled === undefined ||
    !organization ||
    !user ||
    availableCredits === undefined
  ) {
    return <FullLoading />;
  }

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  return (
    <AddEventContent
      organization={organization}
      subscription={subscription}
      connectedAccountEnabled={connectedAccountEnabled}
      isCompanyAdmin={isCompanyAdmin}
      availableCredits={availableCredits}
    />
  );
};

export default AddEventPage;
