import { PublicOrganizationProvider } from "@/contexts/PublicOrganizationContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicOrganizationProvider>{children}</PublicOrganizationProvider>;
}
