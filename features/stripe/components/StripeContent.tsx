"use client";
import { Button } from "@shared/ui/primitive/button";
import { StripeAccountStatus } from "@shared/types/enums";
import { useShowOnboardingLink } from "@/domain/stripe";
import { useStripeDashboardLink } from "@/domain/stripe";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import CustomCard from "@shared/ui/cards/CustomCard";
import StaticField from "@shared/ui/fields/StaticField";
import PageContainer from "@shared/ui/containers/PageContainer";
import { Doc } from "convex/_generated/dataModel";

const StripeContent = ({
  connectedAccount,
}: {
  connectedAccount: Doc<"connectedAccounts"> | null;
}) => {
  const {
    getOnboardingLink,
    isLoading: onboardingLoading,
    error: onboardingLinkError,
  } = useShowOnboardingLink();
  const {
    fetchDashboardLink: getDashboardLink,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useStripeDashboardLink();

  const handleOnboardingClick = async () => {
    const url = await getOnboardingLink();
    if (url) {
      window.location.href = url;
    }
  };

  const handleDashboardClick = async () => {
    const url = await getDashboardLink();

    if (url) {
      window.location.href = url;
    }
  };

  const statusToDisplay =
    connectedAccount?.status || StripeAccountStatus.NOT_ONBOARDED;

  const showOnboardingLink =
    !connectedAccount ||
    connectedAccount.status === StripeAccountStatus.NOT_ONBOARDED;

  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Stripe"
        actions={
          showOnboardingLink ? (
            <Button
              size="nav"
              onClick={handleOnboardingClick}
              isLoading={onboardingLoading}
            >
              Onboard
            </Button>
          ) : (
            <Button
              size="nav"
              onClick={handleDashboardClick}
              isLoading={dashboardLoading}
            >
              Open Stripe{" "}
            </Button>
          )
        }
      />
      {onboardingLinkError && (
        <p className="text-red-500">{onboardingLinkError}</p>
      )}
      {dashboardError && <p className="text-red-500">{dashboardError}</p>}
      <CustomCard className="p-0">
        <StaticField label="Status" value={statusToDisplay} />
      </CustomCard>
    </PageContainer>
  );
};

export default StripeContent;
