import { v } from "convex/values";
import { action } from "./_generated/server";
import { ErrorMessages } from "@/types/enums";
import { internal } from "./_generated/api";

export const sendTicketEmail = action({
  args: {
    to: v.string(),
    templateId: v.string(),
    dynamicTemplateData: v.any(),
  },
  handler: async (ctx, args) => {
    const { to, templateId, dynamicTemplateData } = args;
    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      throw new Error(ErrorMessages.SENDGRID_MISSING_API_KEY);
    }

    const url = "https://api.sendgrid.com/v3/mail/send";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              dynamic_template_data: dynamicTemplateData,
            },
          ],
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || "no-reply@hostly.app",
            name: "Hostly",
          },
          template_id: templateId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error(ErrorMessages.SENDGRID_EMAIL);
    }
  },
});
