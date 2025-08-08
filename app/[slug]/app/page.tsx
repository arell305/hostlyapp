"use client";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import HomeContent from "./HomeContent";
import { canCreateEvent } from "../../../utils/permissions";
import { usePathname } from "next/navigation";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NProgress from "nprogress";
import { Notification } from "./components/ui/Notification";
import Link from "next/link";

const HomePage: React.FC = () => {
  const pathname = usePathname();

  const { connectedAccountEnabled, orgRole } = useContextOrganization();

  const canCreateEvents = canCreateEvent(orgRole);

  const showStripeNotification = !connectedAccountEnabled && canCreateEvents;

  return (
    <SectionContainer>
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
    </SectionContainer>
  );
};

export default HomePage;
