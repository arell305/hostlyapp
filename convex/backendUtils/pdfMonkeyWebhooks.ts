import { ErrorMessages } from "@/types/enums";
import { Webhook } from "svix";
import axios from "axios";
import { Buffer } from "buffer";
import { GenericActionCtx } from "convex/server";
import { api } from "../_generated/api";
import { encode } from "base64-arraybuffer";

export async function verifypdfMonkeyWebhook(
  payload: string,
  headers: Record<string, string>
): Promise<any> {
  const secret = process.env.PDFMONKEY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("PDF Monkey webhook secret is not configured!");
    throw new Error(ErrorMessages.ENV_NOT_SET_PDF_MONKEY);
  }

  try {
    const wh = new Webhook(secret);

    const event = wh.verify(payload, headers);

    return event;
  } catch (error) {
    console.error("Error parsing webhook payload:", error);
    throw new Error(ErrorMessages.PDF_MONKEY_WEBHOOK);
  }
}

export const handleGenerateSuccess = async (
  ctx: GenericActionCtx<any>,
  event: any
) => {
  try {
    const downloadUrl = event.document.download_url;
    if (!downloadUrl) {
      throw new Error(ErrorMessages.PDF_MONKEY_NO_DOWNLOAD_URL);
    }

    const metadata = JSON.parse(event.document.meta || "{}");
    const recipientEmail = metadata.email;

    if (!recipientEmail) {
      console.warn("⚠️ No email found in metadata, skipping email.");
      return;
    }
    const pdfResponse = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
    });

    const base64Pdf = encode(pdfResponse.data);

    await ctx.runAction(api.sendgrid.sendTicketEmail, {
      to: recipientEmail,
      pdfBase64: base64Pdf,
    });
  } catch (error) {
    console.error(" Error in handleGenerateSuccess:", error);
    throw new Error(ErrorMessages.PDF_MONKEY_DOCUMENT_SUCCESS);
  }
};
