"use client";
import { AddButton } from "@/components/shared/buttonContainers/NewItemButton";
import PageContainer from "@/components/shared/containers/PageContainer";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import React from "react";
import CampaignsQuery from "./CampaignsQuery";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NProgress from "nprogress";

const CampaignsPage = () => {
  const pathname = usePathname();

  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Campaigns"
        actions={
          <Link href={`${pathname}/add`}>
            <AddButton onClick={() => NProgress.start()} label="Contact" />
          </Link>
        }
      />

      <CampaignsQuery />
    </PageContainer>
  );
};

export default CampaignsPage;
