"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { PropsWithChildren } from "react";
import React from "react";
import { ErrorMessages } from "./types/enums";
import { dark } from "@clerk/themes";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL as string;

if (!convexUrl) {
  throw new Error(ErrorMessages.ENV_NOT_SET_NEXT_PUBLIC_CONVEX_URL);
}

const clerkPublishableKey = process.env
  .NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string;

if (!clerkPublishableKey) {
  throw new Error(ErrorMessages.ENV_NOT_SET_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: PropsWithChildren) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: [dark],
      }}
      publishableKey={clerkPublishableKey}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
      signInForceRedirectUrl={
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT
      }
      signUpForceRedirectUrl={
        process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT
      }
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
