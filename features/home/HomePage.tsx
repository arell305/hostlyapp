"use client";
import { useContextOrganization } from "@/shared/hooks/contexts";
import HomeContent from "./components/HomeContent";
import { canCreateEvent } from "@shared/utils/permissions";
import { usePathname } from "next/navigation";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import { Button } from "@shared/ui/primitive/button";
import { Plus } from "lucide-react";
import NProgress from "nprogress";
import { Notification } from "@shared/ui/display/Notification";
import Link from "next/link";
import PageContainer from "@shared/ui/containers/PageContainer";

const HomePage: React.FC = () => {
  const pathname = usePathname();

  const { connectedAccountEnabled, orgRole } = useContextOrganization();

  const canCreateEvents = canCreateEvent(orgRole);

  const showStripeNotification = !connectedAccountEnabled && canCreateEvents;

  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="My Events"
        actions={
          canCreateEvents && (
            <Link
              href={`${pathname}/add-event`}
              onClick={() => NProgress.start()}
            >
              <Button size="heading">
                <Plus size={20} />
                <span>Event</span>
              </Button>
            </Link>
          )
        }
        className="mb-0"
      />

      {showStripeNotification && (
        <div className=" md:mb-4">
          <Notification
            title="Stripe Required"
            description="Please integrate Stripe to accept payments."
            route="stripe"
          />
        </div>
      )}

      <HomeContent pathname={pathname} />
    </PageContainer>
  );
};

export default HomePage;
