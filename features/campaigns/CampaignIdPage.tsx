"use client";
import { AddButton } from "@shared/ui/buttonContainers/NewItemButton";
import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import CampaignIdQuery from "./components/CampaignIdLoader";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NProgress from "nprogress";

const CampaignIdPage = () => {
  const pathname = usePathname();

  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Campaign"
        actions={
          <Link href={`${pathname}/add`}>
            <AddButton onClick={() => NProgress.start()} label="Contact" />
          </Link>
        }
      />

      <CampaignIdQuery />
    </PageContainer>
  );
};

export default CampaignIdPage;
