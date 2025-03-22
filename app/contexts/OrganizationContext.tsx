"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ErrorMessages,
  StripeAccountStatus,
  ResponseStatus,
} from "@/types/enums";
import { useParams } from "next/navigation";
import { OrganizationSchema } from "@/types/types";
import { SubscriptionSchema } from "@/types/schemas-types";

type OrganizationContextType = {
  organization?: OrganizationSchema;
  connectedAccountId?: string | null;
  connectedAccountEnabled?: boolean;
  subscription?: SubscriptionSchema;
  organizationContextLoading: boolean;
  organizationContextError: string | null;
  refetchOrganization: () => void;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { slug } = useParams();
  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  const [queryKey, setQueryKey] = useState<string>(cleanSlug);

  const response = useQuery(
    api.organizations.getOrganizationContext,
    queryKey ? { slug: queryKey } : "skip"
  );

  // Re-fetch when slug changes
  useEffect(() => {
    if (cleanSlug && cleanSlug !== queryKey) {
      setQueryKey(cleanSlug);
    }
  }, [cleanSlug, queryKey]);

  return (
    <OrganizationContext.Provider
      value={
        response === undefined
          ? {
              organizationContextLoading: true,
              organizationContextError: null,
              refetchOrganization: () => setQueryKey(cleanSlug),
            }
          : response.status === ResponseStatus.ERROR
            ? {
                organizationContextLoading: false,
                organizationContextError: response.error,
                refetchOrganization: () => setQueryKey(cleanSlug),
              }
            : {
                organization: response.data.organization,
                connectedAccountId: response.data.connectedAccountId,
                connectedAccountEnabled:
                  response.data.connectedAccountStatus ===
                  StripeAccountStatus.VERIFIED,
                subscription: response.data.subscription,
                organizationContextLoading: false,
                organizationContextError: null,
                refetchOrganization: () => setQueryKey(cleanSlug),
              }
      }
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useContextOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(ErrorMessages.CONTEXT_ORGANIZATION_PROVER);
  }
  return context;
};
