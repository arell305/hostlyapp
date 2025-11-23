import { SmsMessageType } from "./enums";
import { CampaignStatus } from "./types";

export type FaqPatch = {
  question: string;
  answer: string;
  isActive: boolean;
};

export type SmsTemplatePatch = {
  body: string;
  messageType: SmsMessageType;
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
};

export type GuestPatch = {
  name?: string;
  phoneNumber?: string;
  isActive?: boolean;
};
