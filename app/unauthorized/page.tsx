"use client";
import MessagePage from "@/components/shared/shared-page/MessagePage";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <MessagePage
      title="Access Denied"
      description="You do not have permission to view this page."
      buttonLabel="Go Home"
      onButtonClick={() => {
        NProgress.start();
        router.push("/");
      }}
    />
  );
}
