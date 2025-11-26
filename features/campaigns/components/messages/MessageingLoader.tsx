"use client";

import { useSmsThreads } from "@/domain/smsThreads/useSmsThreads";
import { useCampaignScope } from "@/shared/hooks/contexts";
import MessagingContainer from "./MessagingContainer";
import MessagePreviewListSkeleton from "@/shared/ui/skeleton/MessagePreviewListSkeleton";

interface MessagingLoaderProps {
  searchTerm: string;
}

const MessagingLoader = ({ searchTerm }: MessagingLoaderProps) => {
  const { campaign } = useCampaignScope();

  const smsThreads = useSmsThreads(campaign._id);

  if (!smsThreads) {
    return <MessagePreviewListSkeleton />;
  }

  return <MessagingContainer smsThreads={smsThreads} searchTerm={searchTerm} />;
};

export default MessagingLoader;
