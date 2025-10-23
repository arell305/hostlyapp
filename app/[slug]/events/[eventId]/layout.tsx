import { EventProvider } from "@/contexts/EventContext";
import { normalizeEventId } from "@/shared/lib/normalizeParams";
import { notFound } from "next/navigation";
import { use } from "react";

export default function PublicEventIdLayout({
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

  return <EventProvider eventId={eventId}>{children}</EventProvider>;
}
