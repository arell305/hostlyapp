"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganizationList } from "@clerk/nextjs";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";

const PostSignupPage = () => {
  const { isSignedIn } = useUser();
  const { isLoaded, userMemberships, setActive } = useOrganizationList();
  const router = useRouter();

  useEffect(() => {
    const handleOrgSet = async () => {
      if (!isSignedIn || !isLoaded) return;

      const org = userMemberships.data[0]?.organization;
      if (org) {
        await setActive({ organization: org.id });
      }

      router.push("/");
    };

    handleOrgSet();
  }, [isSignedIn, isLoaded, userMemberships, setActive, router]);

  return <FullLoading />;
};

export default PostSignupPage;
