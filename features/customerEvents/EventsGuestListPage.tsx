"use client";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import { usePathname, useRouter } from "next/navigation";
import ProfileBanner from "@shared/ui/company/ProfileBanner";
import HomeNav from "@shared/ui/nav/HomeNav";
import NProgress from "nprogress";
import EventGuestListContent from "../guestList/components/EventGuestListContent";

const EventGuestListPage = () => {
  const context = useContextPublicOrganization();
  const { name, photoUrl } = context.organizationPublic;

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
        <ProfileBanner displayPhoto={photoUrl} name={name} />
        <EventGuestListContent onBrowseMore={handleBrowseMoreEvents} />
      </main>
    </div>
  );
};

export default EventGuestListPage;
