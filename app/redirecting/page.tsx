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
  const { setActive, isLoaded: organizationListLoaded } = useOrganizationList();
  const { organization, isLoaded: organizationLoaded } = useOrganization();

  // Change error to string | null
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Skip query if user not loaded
  const organizationResponse = useQuery(
    api.organizations.getOrganizationByClerkUserId,
    user ? { clerkUserId: user.id } : "skip"
  );

  // Timeout fallback (optional but robust)
  useEffect(() => {
    const timeout = setTimeout(
      () => setError("Request timed out. Please try again later."),
      MAX_WAIT_TIME
    );
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const redirect = async () => {
      if (!userLoaded || !organizationLoaded || !organizationListLoaded) return;

      if (!user) {
        NProgress.start();
        router.push("/sign-in");
        return;
      }

      if (organizationResponse === undefined) {
        return;
      }

      if (organizationResponse.status === ResponseStatus.ERROR) {
        setError("Failed to load your organization. Please contact support.");
        return;
      }

      const { organization: orgData } = organizationResponse.data;
      const orgRole = user?.publicMetadata.role as string;

      if (!orgData && pollCount < MAX_POLLS) {
        setTimeout(() => setPollCount((c) => c + 1), POLL_INTERVAL);
        return;
      }

      if (!orgData && pollCount >= MAX_POLLS) {
        setError(
          "Could not find your organization. Please check your account or contact support."
        );
        return;
      }

      if (!orgData && orgRole === UserRole.Admin) {
        NProgress.start();
        router.push("/create-company");
        return;
      }

      if (!orgData) {
        setError("You do not belong to any organization.");
        return;
      }

      if (!organization || organization.id !== orgData.clerkOrganizationId) {
        try {
          await setActive({ organization: orgData.clerkOrganizationId });
          router.refresh();
        } catch (err) {
          setError("Failed to set active organization. Please try again.");
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
    pollCount,
    error, // prevent redirect after error
    organizationListLoaded,
  ]);

  if (error) {
    return <ErrorPage description={error} />;
  }

  return <FullLoading />;
};

export default RedirectingPage;
