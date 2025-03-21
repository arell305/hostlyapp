import { ErrorMessages } from "@/types/enums";
import { CustomerTicket } from "@/types/schemas-types";
import fetch from "node-fetch";

interface DocumentResponse {
  document: {
    id: string;
    status: "pending" | "generating" | "success" | "failure";
  };
}

export const generatePDF = async (
  tickets: CustomerTicket[],
  email: string
): Promise<string> => {
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
};
