import { use } from "react";
import { notFound } from "next/navigation";
import { normalizeEventId } from "@shared/lib/normalizeParams";
import { EventIdScopeProvider } from "@/contexts/EventIdScope";

export default function EventIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId: raw } = use(params);
  const eventId = normalizeEventId(raw);
  if (!eventId) {
    notFound();
  }

  return (
    <EventIdScopeProvider eventId={eventId}>{children}</EventIdScopeProvider>
  );
}
