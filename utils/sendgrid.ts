import fetch from "node-fetch";
import { formatTime, generateQRCodeBase64 } from "./helpers";
import { CustomerTicket } from "@/types/schemas-types";
// import { generateTestPDF } from "./pdf";
import { Buffer } from "buffer";

export const sendTicketEmail = async (
  recipientEmail: string,
  tickets: CustomerTicket[],
  pdfBase64: string
) => {
  try {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDGRID_FROM_EMAIL = "david.anuson@gmail.com"; // Use a verified sender

    if (!SENDGRID_API_KEY) {
      throw new Error("SendGrid API key is missing in Convex environment.");
    }
    const responseDownload = await fetch(pdfBase64);
    if (!responseDownload.ok) {
      throw new Error(`Failed to fetch PDF: ${responseDownload.statusText}`);
    }

    const arrayBuffer = await responseDownload.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // ✅ Generate the PDF and get it as Base64
    // const pdfBase64 = await generateTestPDF();
    // if (!pdfBase64) throw new Error("Failed to generate PDF");
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: SENDGRID_FROM_EMAIL }, // ✅ Verified sender email
        template_id: "d-684d73557dea485f851b241bcef15ca9", // ✅ SendGrid Template ID
        personalizations: [
          {
            to: [{ email: recipientEmail }],
            dynamic_template_data: {
              event_name: tickets[0]?.name || "No Event Name",
              event_address: tickets[0]?.address || "No Address",
              event_start_time: tickets[0]?.startTime
                ? formatTime(tickets[0]?.startTime)
                : "No Start Time",
              event_end_time: tickets[0]?.endTime
                ? formatTime(tickets[0]?.endTime)
                : "No End Time",
              tickets: tickets.map((ticket) => ({
                ticketUniqueId: ticket.ticketUniqueId,
                gender: ticket.gender,
              })),
            },
          },
        ],
        attachments: [
          {
            content: pdfBuffer.toString("base64"), // Attach the PDF as Base64
            filename: "tickets.pdf", // Filename for the attachment
            type: "application/pdf", // MIME type for PDF
            disposition: "attachment", // Indicates this is an attachment
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

    console.log(`✅ Email with PDF sent to ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};
