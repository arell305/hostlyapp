"use client";
import { Button } from "@/components/ui/button";
import { StripeAccountStatus } from "@/types/enums";
import { ConnectedAccountsSchema } from "@/types/schemas-types";
import { useShowOnboardingLink } from "./hooks/useShowOnboardingLink";
import { useStripeDashboardLink } from "./hooks/useStripeDashboardLink";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";

const StripeContent = ({
  connectedAccount,
}: {
  connectedAccount: ConnectedAccountsSchema | undefined;
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
      window.open(url, "_blank");
    }
  };

  const handleDashboardClick = async () => {
    const url = await getDashboardLink();

    if (url) {
      window.open(url, "_blank");
    }
  };

  const statusToDisplay =
    connectedAccount?.status || StripeAccountStatus.NOT_ONBOARDED;

  const showOnboardingLink =
    !connectedAccount ||
    connectedAccount.status === StripeAccountStatus.NOT_ONBOARDED;

  return (
    <section>
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
    </section>
  );
};

export default StripeContent;
