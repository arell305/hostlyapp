// Initialize OpenAI client (uses OPENAI_API_KEY from env)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

// import { ConvexError } from "convex/values";
import { throwConvexError } from "../backendUtils/errors";

// Helper function — pure, testable, reusable
export async function generateAiMessage(prompt: string): Promise<string> {
  try {
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4o-mini", // or "gpt-4o" if you want max quality
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         "You are an expert nightclub and event promoter. Write short, high-converting SMS messages (under 320 characters). Use casual, exciting language that gets people to show up. Include emoji when it feels natural. Never sound corporate.",
    //     },
    //     {
    //       role: "user",
    //       content: prompt,
    //     },
    //   ],
    //   max_tokens: 300,
    //   temperature: 0.8,
    // });

    // const message = completion.choices[0]?.message?.content?.trim();

    // if (!message) {
    return prompt;
  } catch (error) {
    throwConvexError(error, {
      code: "INTERNAL_ERROR",
    });
  }
}
