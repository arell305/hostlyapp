"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { UserRole } from "@shared/types/enums";
import type { UserWithPromoCode } from "@shared/types/types";
import FullLoading from "@shared/ui/loading/FullLoading";
import MessagePage from "@shared/ui/shared-page/MessagePage";
import { Doc } from "convex/_generated/dataModel";
import { getCleanSlug } from "@/shared/utils/params";

export interface GetOrganizationContextData {
  organization: Doc<"organizations">;
  connectedAccountId: string | null | string;
  connectedAccountStatus: string | null;
  subscription: Doc<"subscriptions">;
  availableCredits: number;
  user: UserWithPromoCode;
}

type OrganizationContextType = {
  organization: Doc<"organizations">;
  connectedAccountId: string;
  connectedAccountEnabled: boolean;
  subscription: Doc<"subscriptions">;
  availableCredits: number;
  user: UserWithPromoCode;
  orgRole?: UserRole;
  cleanSlug: string;
};

export const OrganizationContext = createContext<
  OrganizationContextType | undefined
>(undefined);

export const OrganizationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const router = useRouter();
  const { slug } = useParams();
  const cleanSlug = getCleanSlug(slug);

  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const orgRole = (clerkUser?.publicMetadata.role as UserRole) ?? undefined;

  const [data, setData] = useState<GetOrganizationContextData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getContext = useAction(api.organizations.getOrganizationContext);

  useEffect(() => {
    const load = async () => {
      if (!isClerkLoaded) {
        setData(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const result = await getContext({ slug: cleanSlug });

        if (result?.organization && result?.user && result?.subscription) {
          setData(result);
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [cleanSlug, isClerkLoaded, getContext]);

  const value = useMemo<OrganizationContextType | null>(() => {
    if (!data) {
      return null;
    }

    return {
      organization: data.organization,
      connectedAccountId: data.connectedAccountId ?? "",
      connectedAccountEnabled: data.connectedAccountStatus === "Verified",
      subscription: data.subscription,
      availableCredits: data.availableCredits,
      user: data.user,
      orgRole,
      cleanSlug,
    };
  }, [data, orgRole, cleanSlug]);

  if (clerkUser === null) {
    return (
      <MessagePage
        title="Please sign in"
        description="Your session has expired."
        buttonLabel="Sign in"
        onButtonClick={() => router.push("/sign-in")}
      />
    );
  }

  if (isLoading || !value || !isClerkLoaded) {
    return <FullLoading />;
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
