import { CustomerTicket } from "@/types/schemas-types";
import fetch from "node-fetch";

interface DocumentResponse {
  document: {
    id: string;
    status: "pending" | "generating" | "success" | "failure";
    download_url?: string;
  };
}

export const generatePDF = async (
  tickets: CustomerTicket[]
): Promise<string> => {
  const apiKey = process.env.PDFMONKEY_API_KEY; // Your PDFMonkey API key
  const url = "https://api.pdfmonkey.io/api/v1/documents";

  // Step 1: Create a new document
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      document: {
        document_template_id: "8100AF29-ACA9-4F13-BBD4-2E2555689D54",
        payload: { tickets },
        status: "pending", // Set status as 'pending' for synchronous generation
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create document: ${response.statusText}`);
  }

  const data: DocumentResponse = await response.json();

  // Step 2: Poll until the document generation is complete
  while (
    data.document.status === "pending" ||
    data.document.status === "generating"
  ) {
    console.log("Waiting for PDF generation...");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

    const checkResponse = await fetch(`${url}/${data.document.id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const updatedData: DocumentResponse = await checkResponse.json();

    if (updatedData.document.status === "success") {
      console.log("PDF generation successful!");
      return updatedData.document.download_url!; // Return the download URL
    } else if (updatedData.document.status === "failure") {
      throw new Error("PDF generation failed");
    }
  }

  throw new Error("Unexpected error during PDF generation");
};
