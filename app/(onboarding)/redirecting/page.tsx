"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@shared/types/enums";
import { useUser } from "@clerk/nextjs";
import FullLoading from "@/shared/ui/loading/FullLoading";

export default function RedirectingSignUpPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();

  const role = user?.publicMetadata?.role as UserRole | undefined;
  const convexSlug = user?.publicMetadata?.convexSlug as string | undefined;

  useEffect(() => {
    if (!userLoaded) {
      return;
    }

    switch (true) {
      case !!convexSlug:
        router.push(`/${convexSlug}/app`);
        break;
      case role === UserRole.Admin:
        router.push("/create-company");
        break;
      case user === null:
        router.push("/sign-in");
        break;
    }
  }, [router, userLoaded, convexSlug, role, user]);

  return <FullLoading />;
}
