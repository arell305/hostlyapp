// "use client";
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { useQuery } from "convex/react";
// import { api } from "../../convex/_generated/api";
// import {
//   ErrorMessages,
//   StripeAccountStatus,
//   ResponseStatus,
//   UserRole,
// } from "@/types/enums";
// import { useParams } from "next/navigation";
// import { OrganizationSchema } from "@/types/types";
// import { SubscriptionSchema } from "@/types/schemas-types";
// import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import { UserResource } from "@clerk/types";
// type OrganizationContextType = {
//   organization?: OrganizationSchema;
//   connectedAccountId?: string | null;
//   connectedAccountEnabled?: boolean;
//   subscription?: SubscriptionSchema;
//   organizationContextLoading: boolean;
//   organizationContextError: string | null;
//   availableCredits?: number;
//   user?: UserResource | null;
//   orgRole?: UserRole;
// };

// const OrganizationContext = createContext<OrganizationContextType | undefined>(
//   undefined
// );

// export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { slug } = useParams();
//   const router = useRouter();
//   const { user, isLoaded } = useUser();
//   const cleanSlug =
//     typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

//   const orgRole = user?.publicMetadata.role as UserRole;
//   const isHostlyModerator =
//     orgRole === UserRole.Hostly_Moderator || orgRole === UserRole.Hostly_Admin;

//   const response = useQuery(
//     api.organizations.getOrganizationContext,
//     cleanSlug ? { slug: cleanSlug } : "skip"
//   );

//   // Re-fetch when slug changes
//   useEffect(() => {
//     if (!response || !response.data) return;

//     if (isLoaded && !user) {
//       router.push("/sign-in");
//       return;
//     }

//     const org = response.data.organization;
//     if (!org) {
//       router.push("/unauthorized");
//       return;
//     }

//     if (org.slug !== cleanSlug && !isHostlyModerator) {
//       router.push("/unauthorized");
//       return;
//     }

//     if (!org.isActive) {
//       if (orgRole === UserRole.Admin) {
//         router.push(`/${cleanSlug}/app/reactivate`);
//       } else {
//         router.push(`/${cleanSlug}/app/deactivated`);
//       }
//     }
//   }, [response, cleanSlug, isHostlyModerator, orgRole, isLoaded, user, router]);

//   return (
//     <OrganizationContext.Provider
//       value={
//         response === undefined
//           ? {
//               organizationContextLoading: true,
//               organizationContextError: null,
//             }
//           : response.status === ResponseStatus.ERROR
//             ? {
//                 organizationContextLoading: false,
//                 organizationContextError: response.error,
//               }
//             : {
//                 organization: response.data.organization,
//                 connectedAccountId: response.data.connectedAccountId,
//                 connectedAccountEnabled:
//                   response.data.connectedAccountStatus ===
//                   StripeAccountStatus.VERIFIED,
//                 subscription: response.data.subscription,
//                 organizationContextLoading: false,
//                 organizationContextError: null,
//                 availableCredits: response.data.availableCredits,
//                 user,
//                 orgRole,
//               }
//       }
//     >
//       {children}
//     </OrganizationContext.Provider>
//   );
// };

// export const useContextOrganization = () => {
//   const context = useContext(OrganizationContext);
//   if (!context) {
//     throw new Error(ErrorMessages.CONTEXT_ORGANIZATION_PROVER);
//   }
//   return context;
// };

"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ErrorMessages,
  StripeAccountStatus,
  ResponseStatus,
  UserRole,
} from "@/types/enums";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { UserWithPromoCode, OrganizationSchema } from "@/types/types";
import { SubscriptionSchema } from "@/types/schemas-types";

type OrganizationContextType = {
  organization?: OrganizationSchema;
  connectedAccountId?: string | null;
  connectedAccountEnabled?: boolean;
  subscription?: SubscriptionSchema;
  organizationContextLoading: boolean;
  organizationContextError: string | null;
  availableCredits?: number;
  user?: UserWithPromoCode | null;
  orgRole?: UserRole;
  cleanSlug?: string;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

function useHandleOrgRedirects({
  response,
  slug,
  user,
  orgRole,
}: {
  response: any;
  slug: string;
  user: UserWithPromoCode | null;
  orgRole: UserRole;
}) {
  const router = useRouter();
  const isHostlyModerator =
    orgRole === UserRole.Hostly_Moderator || orgRole === UserRole.Hostly_Admin;

  useEffect(() => {
    if (!response || !response.data) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const org = response.data.organization;
    if (!org) {
      router.push("/unauthorized");
      return;
    }

    if (org.slug !== slug && !isHostlyModerator) {
      router.push("/unauthorized");
      return;
    }

    if (!org.isActive) {
      if (orgRole === UserRole.Admin) {
        router.push(`/${slug}/app/reactivate`);
      } else {
        router.push(`/${slug}/app/deactivated`);
      }
    }
  }, [response, slug, user, router, orgRole]);
}

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { slug } = useParams();
  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  const { user: clerkUser, isLoaded } = useUser();
  const orgRole = clerkUser?.publicMetadata.role as UserRole;

  const orgContext = useQuery(
    api.organizations.getOrganizationContext,
    cleanSlug ? { slug: cleanSlug } : "skip"
  );

  const userFromDb = useQuery(
    api.users.findUserByClerkId,
    clerkUser ? { clerkUserId: clerkUser.id } : "skip"
  );

  const user = userFromDb?.data?.user ?? null;

  useHandleOrgRedirects({
    response: orgContext,
    slug: cleanSlug,
    user,
    orgRole,
  });

  const value = useMemo<OrganizationContextType>(() => {
    if (!orgContext || !userFromDb) {
      return {
        organizationContextLoading: true,
        organizationContextError: null,
      };
    }

    if (orgContext.status === ResponseStatus.ERROR) {
      return {
        organizationContextLoading: false,
        organizationContextError: orgContext.error,
      };
    }

    if (userFromDb.status === ResponseStatus.ERROR) {
      return {
        organizationContextLoading: false,
        organizationContextError: userFromDb.error,
      };
    }

    return {
      organization: orgContext.data.organization,
      connectedAccountId: orgContext.data.connectedAccountId,
      connectedAccountEnabled:
        orgContext.data.connectedAccountStatus === StripeAccountStatus.VERIFIED,
      subscription: orgContext.data.subscription,
      availableCredits: orgContext.data.availableCredits,
      organizationContextLoading: false,
      organizationContextError: null,
      user,
      orgRole,
      cleanSlug,
    };
  }, [orgContext, userFromDb, user, orgRole, cleanSlug]);

  return (
    <OrganizationContext.Provider value={value}>
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
