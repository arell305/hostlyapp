import { EventProvider } from "@/contexts/EventContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <EventProvider>{children}</EventProvider>;
}
