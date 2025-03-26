import { ErrorMessages } from "@/types/enums";
import { Buffer } from "buffer";

export const sendTicketEmail = async (
  to: string,
  pdfBuffer: Buffer,
  filename = "tickets.pdf"
): Promise<void> => {
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
            content: Buffer.from(pdfBuffer).toString("base64"),
            filename,
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
    throw new Error(ErrorMessages.SENDGRID_EMAIL);
  }
};
