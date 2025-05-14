"use client";
import { useUser } from "@clerk/nextjs";
import TeamContent from "./TeamContent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import FullLoading from "../components/loading/FullLoading";
import { isManager } from "@/utils/permissions";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { UserSchema } from "@/types/schemas-types";
import NProgress from "nprogress";
const TeamPage = () => {
  const { user } = useUser();
  const { organization } = useContextOrganization();
  const router = useRouter();
  const pathname = usePathname();

  if (!user || !organization) {
    return <FullLoading />;
  }

  const handleMemberClick = (user: UserSchema) => {
    const slug = pathname.split("/")[1];
    NProgress.start();
    router.push(`/${slug}/app/team/${user._id}`);
  };

  const orgRole = user?.publicMetadata.role as string;
  const canManageTeam = isManager(orgRole);

  return (
    <TeamContent
      canManageTeam={canManageTeam}
      organization={organization}
      handleMemberClick={handleMemberClick}
    />
  );
};

export default TeamPage;
