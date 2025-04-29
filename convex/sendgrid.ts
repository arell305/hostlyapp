import { v } from "convex/values";
import { action } from "./_generated/server";
import { ErrorMessages, ResponseStatus } from "@/types/enums";
import { SendContactFormEmailResponse } from "@/types/convex-types";
import { handleError } from "./backendUtils/helper";

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

export const sendContactFormEmail = action({
  args: {
    fromEmail: v.string(),
    fromName: v.string(),
    fromCompany: v.string(),
  },
  handler: async (_, args): Promise<SendContactFormEmailResponse> => {
    const { fromEmail, fromName, fromCompany } = args;

    const url = "https://api.sendgrid.com/v3/mail/send";

    const emailBody = {
      personalizations: [
        {
          to: [{ email: process.env.CONTACT_RECEIVER_EMAIL! }],
        },
      ],
      from: {
        email: process.env.CONTACT_RECEIVER_EMAIL!, // Must be verified
        name: "Hostly Contact Form",
      },
      subject: `New Form Submission: ${fromName}`,
      content: [
        {
          type: "text/plain",
          value: `
You received a new form submission.

From: ${fromName} <${fromEmail}>
Company: ${fromCompany}
          `,
        },
        {
          type: "text/html",
          value: `
            <div style="font-family: sans-serif; font-size: 16px; line-height: 1.5;">
              <h2>New Form Submission</h2>
              <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
              <p><strong>Company:</strong> ${fromCompany}</p>
            </div>
          `,
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(emailBody),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to send contact form email: ${response.statusText}`
        );
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: { email: fromEmail, name: fromName, company: fromCompany },
      };
    } catch (error: any) {
      console.error("Error sending contact form email:", error);
      return handleError(error);
    }
  },
});
