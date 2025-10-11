"use client";
import { AddButton } from "@/components/shared/buttonContainers/NewItemButton";
import PageContainer from "@/components/shared/containers/PageContainer";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import React from "react";
import CampaignIdQuery from "./CampaignIdQuery";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NProgress from "nprogress";

const CampaignClientIdPage = () => {
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

export default CampaignClientIdPage;
