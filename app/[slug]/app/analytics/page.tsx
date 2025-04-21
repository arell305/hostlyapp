"use client";
import React from "react";
import AnalyticsPage from "./AnalyticsPage";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import ErrorComponent from "../components/errors/ErrorComponent";

const page = () => {
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
    <AnalyticsPage
      subscription={subscription}
      organizationId={organization._id}
    />
  );
};

export default page;
