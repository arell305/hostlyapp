"use client";

import { FC } from "react";

import { useContextOrganization } from "@/contexts/OrganizationContext";
import AddEventContent from "./AddEventContent";
import { isManager } from "@/utils/permissions";
import MessagePage from "@/components/shared/shared-page/MessagePage";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";

const AddEventPage: FC = () => {
  const { orgRole, cleanSlug } = useContextOrganization();
  const router = useRouter();

  const isCompanyManagerOrHostly = isManager(orgRole);

  const handleCancel = () => {
    router.back();
  };

  const handleSubmitSuccess = (eventId: string) => {
    NProgress.start();
    router.push(`/${cleanSlug}/app/events/${eventId}`);
  };

  const handleBuyCredit = () => {
    NProgress.start();
    router.push(`/${cleanSlug}/app/subscription`);
  };

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
      onCancel={handleCancel}
      onSubmitSuccess={handleSubmitSuccess}
      onBuyCredit={handleBuyCredit}
    />
  );
};

export default AddEventPage;
