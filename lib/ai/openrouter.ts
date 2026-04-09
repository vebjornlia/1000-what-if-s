import OpenAI from "openai";

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Main model for creative generation (what-ifs, onboarding)
export const MODEL = "anthropic/claude-sonnet-4";

// Cheap model for structured tasks (email discovery)
// DeepSeek V3 is ~22x cheaper than Claude while handling JSON output well
export const MODEL_CHEAP = "deepseek/deepseek-chat-v3-0324:free";
