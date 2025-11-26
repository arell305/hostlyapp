import { use } from "react";
import { notFound } from "next/navigation";
import { normalizeSmsThreadId } from "@/shared/lib/normalizeParams";
import { SmsThreadScopeProvider } from "@/contexts/messages/SmsThreadScopeProvider";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ smsThreadId: string }>;
}) {
  const { smsThreadId: rawSmsThreadId } = use(params);
  const smsThreadId = normalizeSmsThreadId(rawSmsThreadId);

  if (!smsThreadId) {
    notFound();
  }

  return (
    <SmsThreadScopeProvider smsThreadId={smsThreadId}>
      {children}
    </SmsThreadScopeProvider>
  );
}
