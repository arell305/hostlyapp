import { NextRequest, NextResponse } from "next/server";
import sendEmail from "../../lib/email";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const body = await req.json();
    const { name, email, company } = body;

    const message = `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}`;
    sendEmail(name, message);
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error in form entry", error);
    return NextResponse.json(
      { status: "error", error: error as Error },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  return NextResponse.json({ status: 200 });
};
