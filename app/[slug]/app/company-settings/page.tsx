"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import CompanySettingsContent from "./CompanySettingsContent";
import { isManager } from "../../../../utils/permissions";

const CompanySettings = () => {
  const { organization, orgRole } = useContextOrganization();

  const displayCompanyPhoto = useQuery(
    api.photo.getFileUrl,
    organization?.photo ? { storageId: organization.photo } : "skip"
  );

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
