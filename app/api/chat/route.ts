import { openrouter, MODEL } from "@/lib/ai/openrouter";
import { ONBOARDING_SYSTEM_PROMPT, PROFILE_EXTRACTION_PROMPT } from "@/lib/ai/prompts";
import { parseProfileJson } from "@/lib/utils/profileJson";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { messages, action } = await request.json();

    // Profile extraction
    if (action === "extract_profile") {
      const conversationText = messages
        .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
        .join("\n");

      const response = await openrouter.chat.completions.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [
          { role: "system", content: PROFILE_EXTRACTION_PROMPT },
          { role: "user", content: conversationText },
        ],
      });

      const text = response.choices[0]?.message?.content || "{}";

      // Parse defensively: handles clean JSON, fenced code blocks, and JSON
      // embedded in prose, and never throws (falls back to {}).
      const profile = parseProfileJson(text);

      return Response.json({ profile });
    }

    // Regular conversation
    const response = await openrouter.chat.completions.create({
      model: MODEL,
      max_tokens: 512,
      messages: [
        { role: "system", content: ONBOARDING_SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const text = response.choices[0]?.message?.content || "";
    return Response.json({ message: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
