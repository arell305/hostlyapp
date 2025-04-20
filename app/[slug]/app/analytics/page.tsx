"use client";
import React from "react";
import AnalyticsPage from "./AnalyticsPage";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import ErrorComponent from "../components/errors/ErrorComponent";

const page = () => {
  const { organization, organizationContextError, subscription } =
    useContextOrganization();

  console.log("subscription", subscription);

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
    <main>
      <AnalyticsPage
        subscription={subscription}
        organizationId={organization._id}
      />
    </main>
  );
};

export default page;
