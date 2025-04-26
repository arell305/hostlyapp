"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ErrorComponent from "../components/errors/ErrorComponent";
import FullLoading from "../components/loading/FullLoading";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import CompanySettingsContent from "./CompanySettingsContent";
import { useAuth } from "@clerk/nextjs";
import { isManager } from "../../../../utils/permissions";

const CompanySettings = () => {
  const { organization, organizationContextError } = useContextOrganization();
  const { orgRole } = useAuth();

  const displayCompanyPhoto = useQuery(
    api.photo.getFileUrl,
    organization?.photo ? { storageId: organization.photo } : "skip"
  );

  if (!organization || !orgRole) {
    return <FullLoading />;
  }

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  const canEditSettings = isManager(orgRole);

  return (
    <CompanySettingsContent
      organization={organization}
      displayCompanyPhoto={displayCompanyPhoto}
      canEditSettings={canEditSettings}
    />
  );
};

export default CompanySettings;
