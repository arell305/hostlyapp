import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import {
  handleGenerateSuccess,
  verifypdfMonkeyWebhook,
} from "./backendUtils/pdfMonkeyWebhooks";
import { WebhookResponse } from "@/types/convex-types";
import { ErrorMessages } from "@/types/enums";

// example event for success
// {
//     "document": {
//       "app_id": "b8598791-6657-4e7d-8545-20699a6dadc6",
//       "created_at": "2024-09-20T04:40:10+00:00",
//       "document_template_id": "a8ad940f-daef-47f1-b7be-a9fefd5a6495",
//       "document_template_identifier": "My Awesome Template",
//       "download_url": "https://pdfmonkey.s3.eu-west-1.amazonaws.com/production/backend/document/1a56e910-8342-4fd2-82b7-f956434fac75/awesome-report.pdf?response-content-disposition=attachment&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJ2ZTKW4HMOLK63IQ%2F20220510%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20220318T174603Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=74f4678ea431c0537b938708b29f58300e5a2e8c3a8b3d866eff9a916afe2663",
//       "failure_cause": null,
//       "filename": "awesome-report.pdf",
//       "id": "1a56e910-8342-4fd2-82b7-f956434fac75",
//       "meta": "{ \"clientId\": \"ABC-123\" }",
//       "public_share_link": null,
//       "status": "success",
//       "updated_at": "2024-09-20T04:40:13+00:00"
//     }
//   }

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
  gender: v.string(),
  checkInTime: v.optional(v.number()),
  ticketUniqueId: v.string(),
  _creationTime: v.number(),
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
    if (!apiKey) {
      throw new Error(ErrorMessages.PDF_MONKEY_MISSING_API_KEY);
    }

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
            document_template_id: "4577D5A9-27B1-416C-82C9-3EC1D4BBE634",
            payload: { tickets },
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
