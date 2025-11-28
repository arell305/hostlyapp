import { v } from "convex/values";
import { action } from "./_generated/server";
import { generateAiMessage } from "./functions/openAi";
import { throwConvexError } from "./backendUtils/errors";

export const generateMessage = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const { prompt } = args;

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
