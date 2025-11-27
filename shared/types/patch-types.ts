import { AudienceType, CampaignStatus } from "./types";

export type FaqPatch = {
  question: string;
  answer: string;
  isActive: boolean;
};

export type SmsTemplatePatch = {
  body: string;
  name: string;
  isActive: boolean;
};

export type CampaignPatch = {
  name?: string;
  smsBody?: string;
  isActive?: boolean;
  scheduleTime?: number | null;
  promptResponse?: string;
  status?: CampaignStatus;
  audienceType?: AudienceType;
  stopRepliesAt?: number;
  enableAiReplies?: boolean;
  includeFaqInAiReplies?: boolean;
  aiPrompt?: string | null;
};

export type GuestPatch = {
  name?: string;
  phoneNumber?: string;
  isActive?: boolean;
};
