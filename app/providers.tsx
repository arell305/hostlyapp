"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { PropsWithChildren } from "react";
import React from "react";
import { ErrorMessages } from "./types/enums";

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

const appearance = {
  variables: {
    colorBackground: "#0F0F13",
    colorText: "#F9FAFA",
    colorPrimary: "#315DDF",
    colorTextSecondary: "#F9FAFA",
    borderRadius: "8px",
  },
  elements: {
    card: "bg-cardBackground text-whiteText shadow-xl shadow-[0_0_15px_rgba(255,255,255,0.25)] ring-1 ring-white/10",
    headerTitle: "text-whiteText",
    headerSubtitle: "text-grayText",
    socialButtonsBlockButton:
      "bg-cardBackgroundHover text-whiteText border border-primaryBlue hover:bg-borderGray",
    socialButtonsBlockButtonText: "text-whiteText font-medium",
    formFieldInput: "bg-gray-800 text-white",
    userButtonPopoverActionButton:
      "text-white hover:text-white font-semibold hover:bg-cardBackgroundHover transition",
    userButtonPopoverCard:
      "bg-cardBackground text-white shadow-white-glow ring-1 ring-white/10",
    userButtonPopoverActionButton__divider: "border-t border-white/10",
    userButtonPopoverActions:
      "divide-y divide-white/10 border-t border-white/10",
    userButtonPopoverHeader: "border-b border-white/10 pb-3 mb-2",
    primaryButton: "bg-primaryBlue ",
    dividerText: "text-white",
    dividerLine: "bg-white/20",
  },
};

export function Providers({ children }: PropsWithChildren) {
  return (
    <ClerkProvider
      appearance={appearance}
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
