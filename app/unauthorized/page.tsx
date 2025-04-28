"use client";
import StaticPageContainer from "@/components/shared/containers/StaticPageContainer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <StaticPageContainer>
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">
          You do not have permission to view this page.
        </p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Go Home
        </Button>
      </div>
    </StaticPageContainer>
  );
}
