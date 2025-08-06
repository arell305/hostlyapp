"use client";

import { FC } from "react";

import FullLoading from "../components/loading/FullLoading";
import ErrorComponent from "../components/errors/ErrorComponent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import AddEventContent from "./AddEventContent";
import { isAdmin, isManager } from "@/utils/permissions";
import MessagePage from "@/components/shared/shared-page/MessagePage";

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
  const isCompanyManagerOrHostly = isManager(orgRole);

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

  if (!isCompanyManagerOrHostly) {
    return (
      <MessagePage
        title="Unauthorized Access"
        description="You are not authorized to access this page. Please contact support if you believe this is an error."
        buttonLabel="Home"
      />
    );
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
