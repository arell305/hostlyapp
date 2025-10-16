"use client";
import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ErrorMessages } from "@/types/enums";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import { Id } from "../../convex/_generated/dataModel";
import { EventWithTicketTypes } from "@/types/schemas-types";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";

type PublicOrganizationContextType = {
  name: string;
  photo: Id<"_storage"> | null;
  connectedAccountStripeId: string | null;
  isStripeEnabled: boolean;
  publicOrganizationContextError: string | null;
  user?: UserResource | null;
  organizationId?: Id<"organizations">;
  events: EventWithTicketTypes[];
  displayCompanyPhoto: string | null;
  slug: string;
};

const PublicOrganizationContext = createContext<
  PublicOrganizationContextType | undefined
>(undefined);

export const PublicOrganizationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { slug } = useParams();
  const { user } = useUser();
  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  const response = useQuery(
    api.organizations.getPublicOrganizationContext,
    cleanSlug ? { slug: cleanSlug } : "skip"
  );

  const organizationPublic = response ?? null;
  const photoId = organizationPublic?.photo ?? null;

  const displayCompanyPhoto = useQuery(
    api.photo.getFileUrl,
    photoId ? { storageId: photoId } : "skip"
  );

  const contextValue: PublicOrganizationContextType = useMemo(
    () => ({
      name: organizationPublic?.name || "",
      photo: organizationPublic?.photo || null,
      organizationId: organizationPublic?.id,
      slug: cleanSlug,
      connectedAccountStripeId:
        organizationPublic?.connectedAccountStripeId || null,
      isStripeEnabled: organizationPublic?.isStripeEnabled ?? false,
      publicOrganizationContextError: !response
        ? ErrorMessages.COMPANY_DB_QUERY_FOR_ADMIN_ERROR
        : null,
      user,
      events: organizationPublic?.events || [],
      displayCompanyPhoto: displayCompanyPhoto ?? null,
    }),
    [organizationPublic, response, user, displayCompanyPhoto, cleanSlug]
  );

  const loadingPrimary = response === undefined || user === undefined;
  const loadingPhoto = !!photoId && displayCompanyPhoto === undefined;

  if (loadingPrimary || loadingPhoto) {
    return <FullLoading />;
  }

  return (
    <PublicOrganizationContext.Provider value={contextValue}>
      {children}
    </PublicOrganizationContext.Provider>
  );
};

export const useContextPublicOrganization = () => {
  const ctx = useContext(PublicOrganizationContext);
  if (!ctx) {
    throw new Error(ErrorMessages.CONTEXT_ORGANIZATION_PROVER);
  }
  return ctx;
};
