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

  const organizationResponse = useQuery(
    api.organizations.getOrganizationByClerkUserId,
    user && userLoaded ? { clerkUserId: user.id } : "skip"
  );

  useEffect(() => {
    const redirect = async () => {
      console.log("user", user);
      console.log("userLoaded", userLoaded);
      console.log("organizationLoaded", organizationLoaded);
      console.log("organizationResponse", organizationResponse);
      const orgRole = user?.publicMetadata.role as string;
      if (!userLoaded || !organizationLoaded) {
        return;
      }

      if (!user) {
        NProgress.start();
        router.push("/sign-in");
        return;
      }

      if (!organizationResponse || !setActive) {
        return;
      }

      if (organizationResponse.status === ResponseStatus.ERROR) {
        console.error(organizationResponse.error);
        setError(true);
        return;
      }

      const { organization: orgData } = organizationResponse.data;

      if (!orgData) {
        NProgress.start();
        router.push("/create-company");
        return;
      }

      if (!orgData.isActive) {
        NProgress.start();
        router.push("/unauthorized");
        return;
      }

      if (
        orgRole === UserRole.Hostly_Admin ||
        orgRole === UserRole.Hostly_Moderator
      ) {
        router.push(`${orgData.slug}/app/companies`);
        return;
      }

      if (organization) {
        NProgress.start();
        router.push(`/${orgData.slug}/app`);
        return;
      }

      await setActive({ organization: orgData.clerkOrganizationId });
      NProgress.start();
      router.push(`/${orgData.slug}/app`);
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
  ]);

  if (error) {
    return <ErrorPage />;
  }

  return <FullLoading />;
};

export default RedirectingPage;
