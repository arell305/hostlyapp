"use client";

import { FC } from "react";

import FullLoading from "../components/loading/FullLoading";
import ErrorComponent from "../components/errors/ErrorComponent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import AddEventContent from "./AddEventContent";

const AddEventPage: FC = () => {
  const {
    organization,
    organizationContextError,
    subscription,
    connectedAccountEnabled,
  } = useContextOrganization();

  if (!subscription || connectedAccountEnabled === undefined || !organization) {
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
    />
  );
};

export default AddEventPage;
