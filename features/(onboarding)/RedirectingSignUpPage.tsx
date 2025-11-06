"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserRole } from "@shared/types/enums";
import NProgress from "nprogress";
import FullLoading from "@shared/ui/loading/FullLoading";

const MIN_DELAY = 4000;

export default function RedirectingSignUpPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();

  const didRouteRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());

  const role =
    (user?.publicMetadata?.role as UserRole | undefined) ?? undefined;
  const convexSlug = user?.publicMetadata?.convexSlug as string | undefined;

  useEffect(() => {
    if (didRouteRef.current) {
      return;
    }
    if (!userLoaded) {
      return;
    }

    const elapsed = Date.now() - startTimeRef.current;
    const delay = Math.max(0, MIN_DELAY - elapsed);

    const timer = setTimeout(() => {
      if (didRouteRef.current) return;

      NProgress.start();

      if (convexSlug) {
        didRouteRef.current = true;
        router.push(`/${convexSlug}/app`);
        return;
      }

      if (role === UserRole.Admin) {
        didRouteRef.current = true;
        router.push("/create-company");
        return;
      }

      if (!user) {
        didRouteRef.current = true;
        router.push("/sign-in");
        return;
      }

      didRouteRef.current = true;
      router.push("/");
    }, delay);

    return () => clearTimeout(timer);
  }, [userLoaded, user, role, convexSlug, router]);

  return <FullLoading />;
}
