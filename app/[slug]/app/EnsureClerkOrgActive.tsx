"use client";

import { useEffect } from "react";
import { useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import { useContextOrganization } from "@/shared/hooks/contexts";
import { isHostlyUser } from "@/shared/utils/permissions";

type Props = { children?: React.ReactNode };

export default function EnsureClerkOrgActive({ children }: Props) {
  // Your app's org context (should expose clerkOrganizationId)
  const { organization } = useContextOrganization(); // e.g. { clerkOrganizationId: string, ... }
  const expectedId = organization?.clerkOrganizationId ?? null;

  // Clerk state
  const { organization: clerkOrganization, isLoaded: orgLoaded } =
    useOrganization();
  const { setActive, isLoaded: orgListLoaded } = useOrganizationList();
  const { user, isLoaded: userLoaded } = useUser();

  // Skip for Hostly staff
  const role = String(user?.publicMetadata?.role ?? "");
  const isHostlyStaff = isHostlyUser(role);
  const isAdminSlug = organization?.slug === "admin";
  const skipAdmin = isAdminSlug && !isHostlyStaff;

  useEffect(() => {
    // Wait for Clerk and your context
    if (!userLoaded || !orgLoaded || !orgListLoaded) return;
    if (!user) return; // not signed in
    if (skipAdmin) return; // staff: do nothing
    if (!expectedId) return; // context not ready
    if (!setActive) return; // setActive not ready yet

    // Align Clerk's active org with the org for this slug
    if (clerkOrganization?.id !== expectedId) {
      setActive({ organization: expectedId }).catch(() => {
        /* noop */
      });
    }
  }, [
    userLoaded,
    orgLoaded,
    orgListLoaded,
    user,
    isHostlyStaff,
    expectedId,
    clerkOrganization?.id,
    setActive,
    skipAdmin,
  ]);

  // Works as wrapper or self-closing
  return children ?? null;
}
