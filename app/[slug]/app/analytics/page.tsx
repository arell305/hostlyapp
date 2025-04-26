"use client";
import React from "react";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import ErrorComponent from "../components/errors/ErrorComponent";
import AnalyticsContent from "./AnalyticsContent";

const AnalyticsPage = () => {
  const { organization, organizationContextError, subscription } =
    useContextOrganization();

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  if (!subscription) {
    return <ErrorComponent message="No subscription found" />;
  }

  if (!organization) {
    return <ErrorComponent message="No organization found" />;
  }

  return (
    <AnalyticsContent
      subscription={subscription}
      organizationId={organization._id}
    />
  );
};

export default AnalyticsPage;
