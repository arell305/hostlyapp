"use client";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import { useParams, usePathname, useRouter } from "next/navigation";
import React from "react";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import ProfileBanner from "@/components/shared/company/ProfileBanner";
import { usePublicGuestListInfo } from "./hooks/usePublicGuestListInfo";
import { Id } from "convex/_generated/dataModel";
import EventGuestListContent from "./EventGuestListContent";
import { useUser } from "@clerk/nextjs";
import HomeNav from "@/[slug]/app/components/nav/HomeNav";
import NProgress from "nprogress";

const EventGuestListPage = () => {
  const { name, displayCompanyPhoto } = useContextPublicOrganization();

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as Id<"events">;
  const { user } = useUser();

  const { guestListInfo, isLoading, isError, errorMessage } =
    usePublicGuestListInfo(eventId);

  const handleBrowseMoreEvents = () => {
    const slug = pathname.split("/")[1];
    const newUrl = `/${slug}`;
    NProgress.start();
    router.push(newUrl);
  };

  if (isLoading || user === undefined) {
    return <FullLoading />;
  }

  if (isError || guestListInfo === null) {
    return <ErrorComponent message={errorMessage} />;
  }
  return (
    <div>
      <HomeNav user={user} handleNavigateHome={handleBrowseMoreEvents} />
      <main>
        <ProfileBanner displayPhoto={displayCompanyPhoto} name={name} />

        <EventGuestListContent
          guestListInfo={guestListInfo}
          onBrowseMore={handleBrowseMoreEvents}
        />
      </main>
    </div>
  );
};

export default EventGuestListPage;
