import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { preloadQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { PublicOrganizationProvider } from "@/contexts/PublicOrganizationContext";
import { normalizeSlug } from "@/shared/lib/normalizeParams";
import { auth } from "@clerk/nextjs/server";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = normalizeSlug(raw);
  if (!slug) {
    notFound();
  }

  const { userId } = await auth();

  const organizationPublic = await preloadQuery(
    api.organizations.getPublicOrganizationContext,
    { slug }
  );
  if (!organizationPublic) {
    notFound();
  }

  const initial = { userId: userId ?? null, preloadedOrg: organizationPublic };

  return (
    <PublicOrganizationProvider initial={initial}>
      {children}
    </PublicOrganizationProvider>
  );
}
