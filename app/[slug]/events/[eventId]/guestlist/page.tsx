"use client";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import ProfileBanner from "@/components/shared/company/ProfileBanner";
import EventGuestListContent from "./EventGuestListContent";
import HomeNav from "@/[slug]/app/components/nav/HomeNav";
import NProgress from "nprogress";

const EventGuestListPage = () => {
  const { name, displayCompanyPhoto } = useContextPublicOrganization();

  const pathname = usePathname();
  const router = useRouter();

  const handleBrowseMoreEvents = () => {
    const slug = pathname.split("/")[1];
    const newUrl = `/${slug}`;
    NProgress.start();
    router.push(newUrl);
  };

  return (
    <div>
      <HomeNav />
      <main>
        <ProfileBanner displayPhoto={displayCompanyPhoto} name={name} />
        <EventGuestListContent onBrowseMore={handleBrowseMoreEvents} />
      </main>
    </div>
  );
};

export default EventGuestListPage;
