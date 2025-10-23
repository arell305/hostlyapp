import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import {
  handleGenerateSuccess,
  verifypdfMonkeyWebhook,
} from "./webhooks/pdfMonkeyWebhooks";
import { WebhookResponse } from "@/shared/types/convex-types";
import { ErrorMessages } from "@/shared/types/enums";
import { withFormattedTimes } from "./backendUtils/helper";

export const fulfill = internalAction({
  args: {
    headers: v.object({
      svix_id: v.string(),
      svix_signature: v.string(),
      svix_timestamp: v.string(),
    }),
    payload: v.string(),
  },
  handler: async (ctx, { headers, payload }): Promise<WebhookResponse> => {
    try {
      const originalHeaders = {
        "svix-id": headers.svix_id,
        "svix-signature": headers.svix_signature,
        "svix-timestamp": headers.svix_timestamp,
      };

      const event = await verifypdfMonkeyWebhook(payload, originalHeaders);
      switch (event.document.status) {
        case "success":
          await handleGenerateSuccess(ctx, event);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (err) {
      console.error("Error processing webhook:", err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});

interface DocumentResponse {
  document: {
    id: string;
    status: "pending" | "generating" | "success" | "failure";
  };
}

export const customerTicketValidator = v.object({
  _id: v.id("tickets"),
  eventId: v.id("events"),
  promoterUserId: v.union(v.id("users"), v.null()),
  email: v.string(),
  eventTicketTypeName: v.string(),
  checkInTime: v.optional(v.number()),
  ticketUniqueId: v.string(),
  name: v.string(),
  startTime: v.number(),
  endTime: v.number(),
  address: v.string(),
});

export const generatePDF = action({
  args: {
    tickets: v.array(customerTicketValidator),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const { tickets, email } = args;

    const apiKey = process.env.PDFMONKEY_API_KEY;
    if (!apiKey) throw new Error(ErrorMessages.PDF_MONKEY_MISSING_API_KEY);

    // ✨ transform tickets to include PST-formatted strings
    const transformed = tickets.map(withFormattedTimes);

    const url = "https://api.pdfmonkey.io/api/v1/documents";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          document: {
            document_template_id: "8100AF29-ACA9-4F13-BBD4-2E2555689D54",
            payload: {
              tickets: transformed,
              // (optional) include a top-level timezone label if your template needs it
              timezone: "America/Los_Angeles",
            },
            meta: JSON.stringify({ email }),
            status: "pending",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PDF Monkey error response:", errorText);
        throw new Error(`Failed to create document: ${response.statusText}`);
      }

      const rawData = await response.json();
      const data = rawData as DocumentResponse;

      if (!data.document || typeof data.document.id !== "string") {
        throw new Error(ErrorMessages.PDF_MONKEY_GENERATE);
      }

      return data.document.id;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error(ErrorMessages.PDF_MONKEY_GENERATE);
    }
  },
});
