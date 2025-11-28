import { v } from "convex/values";
import { action } from "./_generated/server";
import { generateAiMessage } from "./functions/openAi";
import { throwConvexError } from "./backendUtils/errors";
import { validateAiPromptLength } from "./backendUtils/validation";

export const generateMessage = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const { prompt } = args;

    validateAiPromptLength({ aiPrompt: prompt });

    if (!prompt.trim()) {
      throwConvexError("Prompt cannot be empty", {
        code: "BAD_REQUEST",
        showToUser: true,
      });
    }

    const message = await generateAiMessage(prompt);

    return message;
  },
});
