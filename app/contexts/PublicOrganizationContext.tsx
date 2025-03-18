"use client";
import React, { createContext, useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ResponseStatus } from "../../utils/enum";
import { ErrorMessages } from "@/types/enums";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import { Id } from "../../convex/_generated/dataModel";

type PublicOrganizationContextType = {
  name: string;
  photo: Id<"_storage"> | null;
  connectedAccountStripeId: string | null;
  isStripeEnabled: boolean;
  publicOrganizationContextError: string | null;
  user?: UserResource | null;
  organizationId?: Id<"organizations">;
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

  const organizationData = response?.data?.organizationPublic;

  const contextValue: PublicOrganizationContextType = {
    name: organizationData?.name || "",
    photo: organizationData?.photo || null,
    organizationId: organizationData?.id,
    connectedAccountStripeId:
      organizationData?.connectedAccountStripeId || null,
    isStripeEnabled: organizationData?.isStripeEnabled ?? false,
    publicOrganizationContextError:
      response?.status === ResponseStatus.ERROR
        ? response?.error || null
        : null,
    user,
  };

  return (
    <PublicOrganizationContext.Provider value={contextValue}>
      {children}
    </PublicOrganizationContext.Provider>
  );
};

export const useContextPublicOrganization = () => {
  const context = useContext(PublicOrganizationContext);
  if (!context) {
    throw new Error(ErrorMessages.CONTEXT_ORGANIZATION_PROVER);
  }
  return context;
};
