import { v } from "convex/values";
import { action } from "./_generated/server";
import { ErrorMessages } from "@/types/enums";

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  throw new Error(ErrorMessages.SENDGRID_MISSING_API_KEY);
}

export const sendTicketEmail = action({
  args: {
    to: v.string(),
    pdfBase64: v.string(),
  },
  handler: async (ctx, args) => {
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
              to: [{ email: args.to }],
            },
          ],
          from: {
            email: "david.anuson@gmail.com",
            name: "Hostly",
          },
          subject: "Your Tickets",
          content: [
            {
              type: "text/plain",
              value: "Attached are your tickets.",
            },
          ],
          attachments: [
            {
              content: args.pdfBase64,
              filename: "Your Tickets.pdf",
              type: "application/pdf",
              disposition: "attachment",
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email via SendGrid.");
    }
  },
});
