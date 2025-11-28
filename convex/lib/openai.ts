import OpenAI from "openai";

const openai = (() => {
  if (!process.env.OPENAI_API_KEYa) {
    throw new Error("OPENAI_API_KEY is missing in .env.local");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
})();

export { openai };
