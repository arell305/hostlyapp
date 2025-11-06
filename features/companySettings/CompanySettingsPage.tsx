"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useContextOrganization } from "@/shared/hooks/contexts/useContextOrganization";
import CompanySettingsContent from "@/features/companySettings/components/CompanySettingsContent";
import { isManager } from "@/shared/utils/permissions";

const CompanySettingsPage = () => {
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

export default CompanySettingsPage;
