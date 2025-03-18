import fetch from "node-fetch";
import { ErrorMessages } from "@/types/enums";

export const sendTicketEmail = async (
  recipientEmail: string,
  downloadUrl: string
) => {
  try {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDGRID_FROM_EMAIL = "david.anuson@gmail.com";

    if (!SENDGRID_API_KEY) {
      throw new Error(ErrorMessages.SENDGRID_MISSING_API_KEY);
    }

    const responseDownload = await fetch(downloadUrl);
    if (!responseDownload.ok) {
      throw new Error(`Failed to fetch PDF: ${responseDownload.statusText}`);
    }
    const arrayBuffer = await responseDownload.arrayBuffer();

    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfBase64 = btoa(String.fromCharCode(...uint8Array));

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: SENDGRID_FROM_EMAIL },
        subject: "Your PDF is Ready 📄",
        personalizations: [
          {
            to: [{ email: recipientEmail }],
          },
        ],
        content: [
          {
            type: "text/plain",
            value: "Attached is your PDF. Please find it below.",
          },
        ],
        attachments: [
          {
            content: pdfBase64,
            filename: "document.pdf",
            type: "application/pdf",
            disposition: "attachment",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to send email: ${response.statusText} - ${errorBody}`
      );
    }

    console.log(` Email with PDF sent to ${recipientEmail}`);
  } catch (error) {
    console.error(" Error sending email:", error);
    throw new Error(ErrorMessages.SENDGRID_EMAIL);
  }
};
