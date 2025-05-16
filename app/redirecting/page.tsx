"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganizationList, useOrganization } from "@clerk/nextjs";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { ResponseStatus, UserRole } from "@/types/enums";
import ErrorPage from "@/[slug]/app/components/errors/ErrorPage";
import NProgress from "nprogress";

const RedirectingPage = () => {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { setActive } = useOrganizationList();
  const { organization, isLoaded: organizationLoaded } = useOrganization();
  const [error, setError] = useState(false);
  const [hasSetActive, setHasSetActive] = useState(false);

  const organizationResponse = useQuery(
    api.organizations.getOrganizationByClerkUserId,
    user && userLoaded ? { clerkUserId: user.id } : "skip"
  );

  useEffect(() => {
    const redirect = async () => {
      if (!userLoaded || !organizationLoaded) return;

      if (!user) {
        NProgress.start();
        router.push("/sign-in");
        return;
      }

      if (!organizationResponse || !setActive) return;

      if (organizationResponse.status === ResponseStatus.ERROR) {
        console.error(organizationResponse.error);
        setError(true);
        return;
      }

      const { organization: orgData } = organizationResponse.data;
      const orgRole = user?.publicMetadata.role as string;

      if (!orgData && !organization) {
        return;
      }

      if (!orgData) {
        NProgress.start();
        router.push("/create-company");
        return;
      }

      if (!organization || organization.id !== orgData.clerkOrganizationId) {
        if (!hasSetActive) {
          setHasSetActive(true);
          await setActive({ organization: orgData.clerkOrganizationId });
          setTimeout(() => {
            router.refresh(); // or window.location.reload();
          }, 500);
        }
        return;
      }

      NProgress.start();

      if (
        orgRole === UserRole.Hostly_Admin ||
        orgRole === UserRole.Hostly_Moderator
      ) {
        router.push(`/${orgData.slug}/app/companies`);
      } else {
        router.push(`/${orgData.slug}/app`);
      }
    };

    redirect();
  }, [
    user,
    userLoaded,
    organizationLoaded,
    organizationResponse,
    setActive,
    organization,
    router,
    hasSetActive,
  ]);

  if (error) {
    return <ErrorPage />;
  }

  return <FullLoading />;
};

export default RedirectingPage;
