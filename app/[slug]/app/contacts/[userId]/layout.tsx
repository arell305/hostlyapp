import { use } from "react";
import { notFound } from "next/navigation";
import { normalizeUserId } from "@/lib/normalizeParams";
import { UserScopeProvider } from "@/contexts/UserScope";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}) {
  const { userId: raw } = use(params);
  const userId = normalizeUserId(raw);
  if (!userId) {
    notFound();
  }

  return <UserScopeProvider userId={userId}>{children}</UserScopeProvider>;
}
