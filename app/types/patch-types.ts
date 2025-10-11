import { Id } from "convex/_generated/dataModel";
import { SmsMessageType } from "./enums";

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
  isActive?: boolean;
  eventId?: Id<"events"> | undefined;
  scheduleTime?: number | undefined;
  relativeOffsetMinutes?: number | undefined;
  promptResponse?: string | undefined;
};

export type GuestPatch = {
  name?: string;
  phoneNumber?: string;
  isActive?: boolean;
};
