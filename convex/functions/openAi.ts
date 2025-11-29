// Initialize OpenAI client (uses OPENAI_API_KEY from env)

import { ConvexError } from "convex/values";
import { throwConvexError } from "../backendUtils/errors";
// import { openai } from "../lib/openai";

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

    // console.log("completion", completion.choices[0]?.message?.content?.trim());

    // const message = completion.choices[0]?.message?.content?.trim();

    // if (!message) {
    //   throwConvexError("No response from AI", {
    //     code: "INTERNAL_ERROR",
    //     showToUser: true,
    //   });
    // }
    return prompt;
  } catch (error) {
    throwConvexError(error, {
      code: "INTERNAL_ERROR",
    });
  }
}
