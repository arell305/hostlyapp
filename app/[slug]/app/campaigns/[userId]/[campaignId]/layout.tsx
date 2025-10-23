import { use } from "react";
import { notFound } from "next/navigation";
import { normalizeCampaignId } from "@/shared/lib/normalizeParams";
import { CampaignIdScopeProvider } from "@/contexts/CampaignIdScope";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId: rawCampaignId } = use(params);
  const campaignId = normalizeCampaignId(rawCampaignId);
  if (!campaignId) {
    notFound();
  }

  return (
    <CampaignIdScopeProvider campaignId={campaignId}>
      {children}
    </CampaignIdScopeProvider>
  );
}
