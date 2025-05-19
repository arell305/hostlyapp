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

const MAX_POLLS = 6;
const POLL_INTERVAL = 500; // ms
const MAX_WAIT_TIME = 10000; // 10 seconds

const RedirectingPage = () => {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { setActive } = useOrganizationList();
  const { organization, isLoaded: organizationLoaded } = useOrganization();

  const [error, setError] = useState(false);
  const [hasSetActive, setHasSetActive] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Skip query if user not loaded
  const organizationResponse = useQuery(
    api.organizations.getOrganizationByClerkUserId,
    userLoaded && user ? { clerkUserId: user.id } : "skip"
  );

  // Timeout fallback (optional but robust)
  useEffect(() => {
    const timeout = setTimeout(() => setError(true), MAX_WAIT_TIME);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const redirect = async () => {
      if (userLoaded && !user) {
        NProgress.start();
        router.push("/sign-in");
        return;
      }

      if (!userLoaded || !organizationLoaded) return;

      if (
        !organizationResponse ||
        organizationResponse.status === ResponseStatus.ERROR
      ) {
        setError(true);
        return;
      }

      const { organization: orgData } = organizationResponse.data;
      const orgRole = user?.publicMetadata.role as string;

      if (!orgData && pollCount < MAX_POLLS) {
        setTimeout(() => setPollCount((c) => c + 1), POLL_INTERVAL);
        return;
      }

      if (!orgData && pollCount >= MAX_POLLS) {
        setError(true);
        return;
      }

      if (!orgData && orgRole === UserRole.Admin) {
        NProgress.start();
        router.push("/create-company");
        return;
      }

      if (!orgData) {
        setError(true);
        return;
      }

      if (!organization || organization.id !== orgData.clerkOrganizationId) {
        if (!hasSetActive && setActive) {
          setHasSetActive(true);
          try {
            await setActive({ organization: orgData.clerkOrganizationId });
            router.refresh();
          } catch (err) {
            setError(true);
          }
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

    if (!error) {
      redirect();
    }
  }, [
    user,
    userLoaded,
    organizationLoaded,
    organizationResponse,
    setActive,
    organization,
    router,
    hasSetActive,
    pollCount,
    error, // prevent redirect after error
  ]);

  if (error) {
    return (
      <ErrorPage description="Unable to load your company or redirect. Please try again later." />
    );
  }

  return <FullLoading />;
};

export default RedirectingPage;
