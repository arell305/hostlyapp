"use client";
import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ErrorMessages, ResponseStatus } from "@/types/enums";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import { Id } from "../../convex/_generated/dataModel";
import { EventWithTicketTypes } from "@/types/schemas-types";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";

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

  // Always call hooks in the same order
  const response = useQuery(
    api.organizations.getPublicOrganizationContext,
    cleanSlug ? { slug: cleanSlug } : "skip"
  );

  const organizationPublic = response?.data?.organizationPublic ?? null;
  const photoId = organizationPublic?.photo ?? null;

  const displayCompanyPhoto = useQuery(
    api.photo.getFileUrl,
    photoId ? { storageId: photoId } : "skip"
  );
  // Compute memo BEFORE any early returns
  const contextValue: PublicOrganizationContextType = useMemo(
    () => ({
      name: organizationPublic?.name || "",
      photo: organizationPublic?.photo || null,
      organizationId: organizationPublic?.id,
      slug: cleanSlug,
      connectedAccountStripeId:
        organizationPublic?.connectedAccountStripeId || null,
      isStripeEnabled: organizationPublic?.isStripeEnabled ?? false,
      publicOrganizationContextError:
        response?.status === ResponseStatus.ERROR
          ? response?.error || null
          : null,
      user,
      events: organizationPublic?.events || [],
      // If still loading the photo query, keep it null; otherwise string or null
      displayCompanyPhoto: displayCompanyPhoto ?? null,
    }),
    [
      organizationPublic,
      response?.status,
      response?.data,
      user,
      displayCompanyPhoto,
    ]
  );

  // Now gate what you render (no hooks below this point)
  const loadingPrimary = response === undefined || user === undefined;
  const loadingPhoto = !!photoId && displayCompanyPhoto === undefined;

  if (loadingPrimary || loadingPhoto) return <FullLoading />;

  if (response?.status === ResponseStatus.ERROR) {
    return (
      <ErrorComponent
        message={
          response?.error || ErrorMessages.COMPANY_DB_QUERY_FOR_ADMIN_ERROR
        }
      />
    );
  }

  return (
    <PublicOrganizationContext.Provider value={contextValue}>
      {children}
    </PublicOrganizationContext.Provider>
  );
};

export const useContextPublicOrganization = () => {
  const ctx = useContext(PublicOrganizationContext);
  if (!ctx) throw new Error(ErrorMessages.CONTEXT_ORGANIZATION_PROVER);
  return ctx;
};
