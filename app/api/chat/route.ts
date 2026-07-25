import { openrouter, MODEL } from "@/lib/ai/openrouter";
import { ONBOARDING_SYSTEM_PROMPT, PROFILE_EXTRACTION_PROMPT } from "@/lib/ai/prompts";
import { parseJsonObject } from "@/lib/utils/parseJson";

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

      // The model's output is untrusted: it may wrap the JSON in prose or a
      // markdown code fence, or emit malformed JSON (e.g. unquoted keys).
      // parseJsonObject always returns a usable object so a bad response
      // downgrades to an empty profile rather than throwing a 500 that would
      // leave the onboarding review screen with an undefined profile.
      const profile = parseJsonObject(text);

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
