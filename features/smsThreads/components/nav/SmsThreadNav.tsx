"use client";

import TopBarContainer from "@/shared/ui/containers/TopBarContainer";
import { useSmsThreadData } from "../../provider/SmsThreadDataProvider";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContextOrganization } from "@/shared/hooks/contexts";
import CenteredTitle from "@/shared/ui/headings/CenteredTitle";
import { Badge } from "@/shared/ui/primitive/badge";

const SmsThreadNav = () => {
  const { smsThread, contact } = useSmsThreadData();
  const { cleanSlug } = useContextOrganization();
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(
        `/${cleanSlug}/app/campaigns/${contact.userId}/${contact._id}`
      );
    }
  };

  const needsReply = smsThread.needsHumanReview;

  return (
    <TopBarContainer>
      <IconButton
        icon={<ArrowLeft size={20} />}
        onClick={handleGoBack}
        title="Back"
        variant="ghost"
      />
      <CenteredTitle title={contact.name} />
      {needsReply && <Badge variant="destructive">Needs Reply</Badge>}
    </TopBarContainer>
  );
};

export default SmsThreadNav;
